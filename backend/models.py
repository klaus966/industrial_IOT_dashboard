from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
import enum

class MachineStatus(str, enum.Enum):
    HEALTHY = "Healthy"
    ALERT = "Alert"
    DANGER = "Danger"
    CRITICAL = "Critical"

class MachineType(str, enum.Enum):
    MOTOR = "Motor"
    FAN = "Fan"
    COMPRESSOR = "Compressor"
    PUMP = "Pump"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user") # admin, user
    is_active = Column(Boolean, default=True)

class Machine(Base):
    __tablename__ = "machines"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String) # MachineType
    location = Column(String)
    status = Column(String, default=MachineStatus.HEALTHY)
    image_url = Column(String, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    sensor_data = relationship("SensorData", back_populates="machine")

class SensorData(Base):
    __tablename__ = "sensor_data"
    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    temperature = Column(Float)
    speed = Column(Float) # RPM? Velocity?
    vibration = Column(Float) # RMS
    health_score = Column(Float) # 0-100
    
    machine = relationship("Machine", back_populates="sensor_data")
