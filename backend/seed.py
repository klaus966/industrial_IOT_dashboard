from backend.database import SessionLocal, engine, Base
from backend.models import User, Machine, MachineType, MachineStatus
from backend.auth import get_password_hash

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if data exists
    if db.query(User).first():
        print("Database already seeded.")
        return

    print("Seeding database...")
    
    # Create Admin
    admin = User(
        email="admin@example.com",
        hashed_password=get_password_hash("password123"),
        role="admin"
    )
    db.add(admin)
    
    # Create Machines
    machines = [
        {"name": "Main Motor A", "type": MachineType.MOTOR, "location": "Floor 1"},
        {"name": "Cooling Fan B", "type": MachineType.FAN, "location": "Floor 1"},
        {"name": "Compressor X", "type": MachineType.COMPRESSOR, "location": "Utility Room"},
        {"name": "Feed Pump 1", "type": MachineType.PUMP, "location": "Floor 2"},
        {"name": "Feed Pump 2", "type": MachineType.PUMP, "location": "Floor 2"},
    ]
    
    for m in machines:
        machine = Machine(**m, status=MachineStatus.HEALTHY)
        db.add(machine)
        
    db.commit()
    print("Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_db()
