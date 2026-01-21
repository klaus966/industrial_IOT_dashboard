import asyncio
import random
from datetime import datetime
from sqlalchemy.orm import Session
from . import models, database

# Simulation Parameters
class MachineState:
    def __init__(self, machine_id):
        self.machine_id = machine_id
        self.temp = random.uniform(60, 80)
        self.speed = random.uniform(1000, 2000)
        self.vibration = random.uniform(0.5, 2.0)
        self.health = 100.0
        self.status = "Healthy"
    
    def update(self):
        # Random walk
        self.temp += random.uniform(-1, 1)
        self.speed += random.uniform(-50, 50)
        self.vibration += random.uniform(-0.1, 0.1)
        
        # Drift towards chaos occasionally
        if random.random() > 0.95:
             self.temp += random.uniform(2, 5) # Spike
             self.vibration += random.uniform(0.5, 1.0) # Spike
        
        # Health calculation (simplified)
        stress = 0
        if self.temp > 90: stress += 0.5
        if self.vibration > 5: stress += 1.0
        
        self.health -= stress * 0.1
        self.health = max(0, min(100, self.health))
        
        # Determine Status
        if self.health > 80: self.status = "Healthy"
        elif self.health > 50: self.status = "Alert"
        elif self.health > 20: self.status = "Danger"
        else: self.status = "Critical"
        
        return {
            "temperature": self.temp,
            "speed": self.speed,
            "vibration": self.vibration,
            "health_score": self.health
        }

machine_states = {}

async def run_simulation():
    """Background task to generate data."""
    print("Starting Sensor Simulation...")
    while True:
        db = database.SessionLocal()
        try:
            machines = db.query(models.Machine).all()
            
            for machine in machines:
                if machine.id not in machine_states:
                    machine_states[machine.id] = MachineState(machine.id)
                
                state = machine_states[machine.id]
                data = state.update()
                
                # Save Sensor Data
                sensor_reading = models.SensorData(
                    machine_id=machine.id,
                    timestamp=datetime.utcnow(),
                    **data
                )
                db.add(sensor_reading)
                
                # Update Machine Status
                machine.status = state.status
                machine.last_updated = datetime.utcnow()
                db.add(machine)
            
            db.commit()
            
        except Exception as e:
            print(f"Simulation Error: {e}")
            db.rollback()
        finally:
            db.close()
            
        await asyncio.sleep(5) # Run every 5 seconds
