import pytesseract
import os
from PIL import Image

# Only set windows path when running locally
if os.name == 'nt':  # Windows
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def analyze_text(image_path):
    try:
        text = pytesseract.image_to_string(Image.open(image_path))
        suspicious_keywords = ["fake", "copy", "sample"]
        score = 30
        for word in suspicious_keywords:
            if word in text.lower():
                score += 20
        return min(score, 100)
    except Exception:
        return 30  # return neutral score if OCR fails