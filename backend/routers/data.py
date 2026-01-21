from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models, schemas, auth

router = APIRouter(
    prefix="/data",
    tags=["Sensor Data"]
)

@router.get("/latest", response_model=List[schemas.SensorData])
def get_latest_data(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Get latest reading for each machine. This can be optimized.
    machines = db.query(models.Machine).all()
    results = []
    for m in machines:
        reading = db.query(models.SensorData).filter(models.SensorData.machine_id == m.id).order_by(models.SensorData.timestamp.desc()).first()
        if reading:
            results.append(reading)
    return results

@router.get("/{machine_id}", response_model=List[schemas.SensorData])
def get_machine_history(machine_id: int, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    readings = db.query(models.SensorData).filter(models.SensorData.machine_id == machine_id).order_by(models.SensorData.timestamp.desc()).limit(limit).all()
    # Return reversed to show chronological order in charts if needed, or frontend handles it
    return readings
