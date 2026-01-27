import sys
import os

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

from backend.ml.metadata import analyze_metadata
from backend.ml.text_analysis import analyze_text
from backend.ml.image_forgery.analysis import analyze_image 
from backend.app.schemas import FraudResult, FraudBreakdown
from backend.app.report import generate_report


app = FastAPI(title="Document Fraud Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust later for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
TEMP_DIR = Path("temp")
UPLOAD_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)

app.mount("/temp", StaticFiles(directory="temp"), name="temp")

@app.post("/analyze", response_model=FraudResult)
async def analyze_document(file: UploadFile = File(...)):
    """
    Full forensic pipeline:
    - Image forgery detection (ELA, noise, color, clone)
    - OCR text analysis
    - Metadata forensics
    - Weighted scoring + confidence model
    """

    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as f:
        f.write(await file.read())

    image_score, ela_path, edge_path, clone_path = analyze_image(file_path)
    text_score = analyze_text(file_path)
    meta_score = analyze_metadata(file_path)

    fraud_score = int(
        (image_score * 0.45) +
        (meta_score  * 0.30) +
        (text_score  * 0.25)
    )

    variance = np.var([image_score, meta_score, text_score])

    if variance < 150:
        confidence = "High"
    elif variance < 400:
        confidence = "Medium"
    else:
        confidence = "Low"

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
        breakdown=FraudBreakdown(
            image=image_score,
            text=text_score,
            meta=meta_score,
            elaHeatmap=ela_path,
            edgeMap=edge_path,
            cloneMap=clone_path
        )
    )
@app.post("/report")
async def generate_pdf(result: dict):
    output_path = f"temp/report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    generate_report(output_path, result)
    return FileResponse(output_path, media_type="application/pdf", filename="report.pdf")
