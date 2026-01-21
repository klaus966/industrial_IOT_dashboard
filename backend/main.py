import asyncio
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import database
from .database import engine, Base
from .routers import auth, machines, data, reports
from .simulation import run_simulation
from contextlib import asynccontextmanager

# --- Database Initialization ---
# Create all tables defined in models.py if they don't exist
Base.metadata.create_all(bind=engine)

# --- App Lifecycle Management ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handle startup and shutdown events.
    Starts the sensor data simulation as a background task.
    """
    # Startup: Run simulation loop
    sim_task = asyncio.create_task(run_simulation())
    yield
    # Shutdown: Cancel simulation to clean up resources
    sim_task.cancel()

# --- FastAPI App Instance ---
app = FastAPI(title="Industrial IoT Dashboard API", lifespan=lifespan)

# --- CORS Configuration ---
# Allow frontend (running on different port) to access this API
origins = ["*"] # WARNING: Use specific domains in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],
)

# --- Router Registration ---
# Include routes from different modules
app.include_router(auth.router)      # Authentication endpoints
app.include_router(machines.router)  # Machine CRUD operations
app.include_router(data.router)      # Sensor data endpoints
app.include_router(reports.router)   # PDF report generation

# --- Root Endpoint ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the Industrial IoT API. Visit /docs for Swagger UI."}

# --- Health Check ---
@app.get("/health")
def health_check(db: Session = Depends(database.get_db)):
    """
    Simple health check to verify API and Database connectivity.
    """
    try:
        # Check database connection by executing a simple query
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=503, 
            detail=f"Database Disconnected: {str(e)}"
        )
