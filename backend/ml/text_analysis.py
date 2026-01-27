import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
from PIL import Image

def analyze_text(image_path):
    text = pytesseract.image_to_string(Image.open(image_path))

    suspicious_keywords = ["fake", "copy", "sample"]
    score=30

    for word in suspicious_keywords:
        if word in text.lower():
            score += 20

    return min(score, 100)