import asyncio
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import database
from .database import engine, Base
from .routers import auth, machines, data, reports
from .simulation import run_simulation
from contextlib import asynccontextmanager

# Create Tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    sim_task = asyncio.create_task(run_simulation())
    yield
    # Shutdown
    sim_task.cancel()

app = FastAPI(title="Industrial IoT Dashboard API", lifespan=lifespan)

# CORS Configuration
origins = ["*"] # Allow all for dev, or specify
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(machines.router)
app.include_router(data.router)
app.include_router(reports.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Industrial IoT API. Visit /docs for Swagger UI."}

@app.get("/health")
def health_check(db: Session = Depends(database.get_db)):
    try:
        # Check database connection
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=503, 
            detail=f"Database Disconnected: {str(e)}"
        )
