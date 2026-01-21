from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .models import MachineStatus, MachineType

# --- User Schemas ---
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    role: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Machine Schemas ---
class MachineBase(BaseModel):
    name: str
    type: str
    location: str
    image_url: Optional[str] = None

class MachineCreate(MachineBase):
    pass

class MachineUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None

class Machine(MachineBase):
    id: int
    status: str
    last_updated: Optional[datetime] = None
    class Config:
        from_attributes = True

# --- Sensor Data Schemas ---
class SensorDataBase(BaseModel):
    temperature: float
    speed: float
    vibration: float
    health_score: float

class SensorDataCreate(SensorDataBase):
    machine_id: int

class SensorData(SensorDataBase):
    id: int
    machine_id: int
    timestamp: datetime
    class Config:
        from_attributes = True
