from PIL import Image
from PIL.ExifTags import TAGS
import PyPDF2
import os


def extract_image_metadata(file_path):
    try:
        img = Image.open(file_path)
        info = img._getexif() or {}
        metadata = {}

        for tag_id, value in info.items():
            tag = TAGS.get(tag_id, tag_id)
            metadata[str(tag)] = value

        # Add DPI info if present
        if "dpi" in img.info:
            metadata["DPI"] = img.info["dpi"]

        return metadata
    except Exception:
        return None


def extract_pdf_metadata(file_path):
    try:
        reader = PyPDF2.PdfReader(open(file_path, 'rb'))
        info = reader.metadata
        return dict(info) if info else {}
    except Exception:
        return None


def analyze_metadata(file_path):

    file_ext = os.path.splitext(file_path)[1].lower()

    if file_ext in ['.jpg', '.jpeg', '.png', '.tiff']:
        metadata = extract_image_metadata(file_path)
    elif file_ext == ".pdf":
        metadata = extract_pdf_metadata(file_path)
    else:
        return 50  # neutral for unknown types

    # Missing metadata
    if metadata is None:
        return 85  # very suspicious: scrubbed metadata

    score = 0

    # ============ RULE 1: No Metadata ============
    if len(metadata) == 0:
        score += 60

    # ============ RULE 2: Software Fingerprints ============
    suspicious_software = [
        "photoshop", "gimp", "lightroom", "snapseed", "picsart",
        "adobe", "foxit", "nitro", "ilovepdf", "pdf", "scanner", "ghostscript"
    ]

    for key, value in metadata.items():
        if not isinstance(value, str):
            continue

        val = value.lower()
        if any(sw in val for sw in suspicious_software):
            score += 30

    # ============ RULE 3: Timestamp Conflicts (PDF only) ============
    if file_ext == ".pdf":
        cdate = metadata.get("/CreationDate")
        mdate = metadata.get("/ModDate")

        if cdate and mdate:
            try:
                if cdate > mdate:
                    score += 40  # impossible timestamp, manipulated
                elif cdate != mdate:
                    score += 20  # edited post creation
            except:
                pass

    # ============ RULE 4: Camera Spoofing (Images) ============
    if file_ext in ['.jpg', '.jpeg', '.png', '.tiff']:
        has_make = "Make" in metadata
        has_model = "Model" in metadata

        if has_make and not has_model:
            score += 20  # spoof attempt
        if has_model and not has_make:
            score += 20

        # DPI Check
        dpi = metadata.get("DPI")
        if dpi and isinstance(dpi, tuple):
            xdpi, ydpi = dpi
            if xdpi <= 72 or ydpi <= 72:
                score += 20  # scanned / downsampled doc

    # ============ RULE 5: Genuine Camera Bonus ============
    if "Model" in metadata and "Make" in metadata and "Software" not in metadata:
        score -= 25  # seems directly from camera, not edited

    # Normalize score
    score = max(0, min(100, score))
    return score
