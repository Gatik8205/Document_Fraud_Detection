from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from datetime import datetime
from pathlib import Path

def generate_report(output_path, result:dict):
    c=canvas.Canvas(output_path, pagesize=A4)
    width, height = A4

    y=height - 30*mm
    c.setFont("Helvetica-Bold", 16)
    c.drawString(20*mm, y, "Document Fraud Analysis Report")

    y-= 15*mm
    c.setFont("Helvetica", 12)
    c.drawString(20*mm, y, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    y-= 10*mm
    c.setFont("Helvetica-Bold", 12)
    c.drawString(20*mm, y, f"Final Decision:{result['decision']}")

    y-= 7*mm
    c.setFont("Helvetica", 12)
    c.drawString(20*mm,y,f"Fraud Score: {result['fraudScore']}")

    y-= 7*mm
    c.drawString(20*mm,y,f"Confidence : {result['confidence']}")

    breakdown = result["breakdown"]

    y-= 15*mm
    c.setFont("Helvetica-Bold", 12)
    c.drawString(25*mm, y, "Score Breakdown:")

    y -= 7*mm
    c.setFont("Helvetica", 12)
    c.drawString(25*mm, y, f"• Image Forgery: {breakdown['image']}%")

    y -= 7*mm
    c.drawString(25*mm, y, f"• Text Integrity: {breakdown['text']}%")

    y -= 7*mm
    c.drawString(25*mm, y, f"• Metadata Analysis: {breakdown['meta']}%")

    # Heatmaps Section
    y -= 15*mm
    c.setFont("Helvetica-Bold", 12)
    c.drawString(20*mm, y, "Forensic Heatmaps:")

    for label, key in [
        ("ELA", "elaHeatmap"),
        ("Edges", "edgeMap"),
        ("Clone Detection", "cloneMap")
    ]:
        y -= 40*mm
        img_path = breakdown.get(key)
        if img_path and Path("." + img_path).exists():
            c.setFont("Helvetica", 10)
            c.drawString(25*mm, y + 35*mm, label)
            c.drawImage("." + img_path, 25*mm, y, width=60*mm, height=35*mm)

    c.showPage()
    c.save()