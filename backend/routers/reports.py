from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime
from .. import database, models, auth

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

@router.get("/summary", response_class=Response)
def generate_summary_report(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Fetch Data
    machines = db.query(models.Machine).all()
    
    # Generate PDF
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Header
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, height - 50, "Industrial IoT - Plant Health Report")
    
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 70, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    c.line(50, height - 80, width - 50, height - 80)
    
    # Stats
    y = height - 120
    total = len(machines)
    critical = len([m for m in machines if m.status == "Critical"])
    healthy = len([m for m in machines if m.status == "Healthy"])
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Plant Summary")
    y -= 25
    c.setFont("Helvetica", 12)
    c.drawString(60, y, f"Total Assets: {total}")
    c.drawString(200, y, f"Healthy: {healthy}")
    c.setFillColor(colors.red)
    c.drawString(350, y, f"Critical: {critical}")
    c.setFillColor(colors.black)
    
    y -= 40
    c.line(50, y, width - 50, y)
    y -= 30
    
    # Machine Table Header
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Machine")
    c.drawString(200, y, "Type")
    c.drawString(350, y, "Location")
    c.drawString(480, y, "Status")
    y -= 20
    
    # Machine Rows
    c.setFont("Helvetica", 12)
    for m in machines:
        if y < 50: # New Page if space is low
             c.showPage()
             y = height - 50
        
        c.drawString(50, y, m.name)
        c.drawString(200, y, m.type)
        c.drawString(350, y, m.location)
        
        if m.status in ["Critical", "Danger"]:
            c.setFillColor(colors.red)
        elif m.status == "Healthy":
            c.setFillColor(colors.green)
        else:
             c.setFillColor(colors.orange)
             
        c.drawString(480, y, m.status)
        c.setFillColor(colors.black)
        y -= 20

    c.save()
    
    buffer.seek(0)
    return Response(content=buffer.getvalue(), media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=report.pdf"})
