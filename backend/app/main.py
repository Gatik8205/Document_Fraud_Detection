import sys
import os
# Fix Python path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
print("PROJECT_ROOT:", PROJECT_ROOT)
print("PYTHONPATH:", sys.path)
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from datetime import datetime
import numpy as np
import fitz  # PyMuPDF ← NEW
from PIL import Image  # ← NEW
import io  # ← NEW
from backend.ml.metadata import analyze_metadata
from backend.ml.text_analysis import analyze_text
from backend.ml.image_forgery.analysis import analyze_image
from backend.ml.cnn_inference import predict_cnn_score
from backend.app.schemas import FraudResult, FraudBreakdown
from backend.app.report import generate_report

app = FastAPI(title="Document Fraud Detection API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://document-fraud-detection.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR=Path(__file__).resolve().parent.parent
UPLOAD_DIR= BASE_DIR / "uploads"
TEMP_DIR = BASE_DIR / "temp"
UPLOAD_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)

app.mount("/temp", StaticFiles(directory=str(TEMP_DIR)), name="temp")


# ─── NEW: PDF → images helper ─────────────────────────────────────────────────
def convert_pdf_to_images(pdf_path: Path) -> list[Path]:
    """Render every PDF page to a PNG and return their paths."""
    doc = fitz.open(str(pdf_path))
    image_paths = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
        image = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
        out_path = UPLOAD_DIR / f"{pdf_path.stem}_page{page_num + 1}.png"
        image.save(out_path)
        image_paths.append(out_path)
    doc.close()
    return image_paths
# ──────────────────────────────────────────────────────────────────────────────


@app.post("/analyze", response_model=FraudResult)
async def analyze_document(file: UploadFile = File(...)):
    """
    Full forensic pipeline:
    - Image forgery detection (ELA, noise, color, clone)
    - CNN inference + GradCAM
    - OCR text analysis
    - Metadata forensics
    - Hybrid weighted scoring
    """
    file_path = UPLOAD_DIR / file.filename

    # Save uploaded file
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # ─── NEW: Multi-page PDF handling ─────────────────────────────────────────
    flagged_page = None
    total_pages = 1

    if file.filename.lower().endswith(".pdf"):
        page_paths = convert_pdf_to_images(file_path)

        if not page_paths:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="PDF has no pages")

        total_pages = len(page_paths)

        # Run CNN on every page, pick worst (highest fraud score)
        page_results = []
        for page_path in page_paths:
            score, gcam = predict_cnn_score(str(page_path))
            page_results.append({
                "path": page_path,
                "cnn_score": score,
                "gradcam_path": gcam
            })

        worst = max(page_results, key=lambda x: x["cnn_score"])
        file_path = worst["path"]          # use worst page for rest of pipeline
        flagged_page = page_results.index(worst) + 1
    # ──────────────────────────────────────────────────────────────────────────

    # Classical image forensics
    cv_image_score, ela_path, edge_path, clone_path = analyze_image(file_path)

    # CNN + GradCAM (already computed for worst page if PDF, runs fresh for images)
    cnn_image_score, gradcam_path = predict_cnn_score(str(file_path))

    # Hybrid image score
    image_score = int(
        0.6 * cnn_image_score +
        0.4 * cv_image_score
    )

    # Text + metadata analysis
    text_score = analyze_text(file_path)
    meta_score = analyze_metadata(file_path)

    # Final fraud score
    fraud_score = int(
        (image_score * 0.45) + (meta_score * 0.30) + (text_score * 0.25)
    )

    # Confidence calculation
    variance = np.var([image_score, meta_score, text_score])
    if variance < 150:
        confidence = "High"
    elif variance < 400:
        confidence = "Medium"
    else:
        confidence = "Low"

    # Decision logic
    if confidence == "Low":
        decision = "Inconclusive"
    elif fraud_score < 30:
        decision = "Low Risk"
    elif fraud_score < 60:
        decision = "Suspicious"
    else:
        decision = "High Risk"

    return FraudResult(
        fraudScore=fraud_score,
        confidence=confidence,
        decision=decision,
        flaggedPage=flagged_page,     # ← NEW
        totalPages=total_pages,        # ← NEW
        breakdown=FraudBreakdown(
            image=image_score,
            text=text_score,
            meta=meta_score,
            elaHeatmap=ela_path,
            edgeMap=edge_path,
            cloneMap=clone_path,
            gradcamMap=gradcam_path
        )
    )


@app.post("/report")
async def generate_pdf(result: dict):
    output_path = f"temp/report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    generate_report(output_path, result)
    return FileResponse(
        output_path,
        media_type="application/pdf",
        filename="report.pdf"
    )