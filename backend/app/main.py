import uuid
from datetime import datetime, timezone, timedelta
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.session import init_db, SessionLocal
from backend.app.db.models import Job, GridMetric
from backend.app.api.router import api_router
from backend.app.ml.predictor import forecaster
from backend.app.services.grid_monitor import grid_monitor

def seed_database():
    db = SessionLocal()
    try:
        # Check if already seeded
        job_count = db.query(Job).count()
        if job_count == 0:
            now = datetime.now(timezone.utc)
            sample_jobs = [
                Job(
                    id=uuid.uuid4(),
                    name="LLM Fine-Tuning (Llama-3-70B Odisha Dialect)",
                    type="AI Training",
                    energy_requirement=840.0,
                    priority="High",
                    flexibility="Flexible",
                    deadline=now + timedelta(hours=6),
                    status="Executing",
                    required_renewable_pct=65.0,
                    created_at=now - timedelta(hours=2),
                    executed_at=now - timedelta(minutes=45),
                ),
                Job(
                    id=uuid.uuid4(),
                    name="Satellite Forest Canopy InSAR Processing",
                    type="Data Processing",
                    energy_requirement=420.0,
                    priority="Medium",
                    flexibility="Flexible",
                    deadline=now + timedelta(hours=8),
                    status="Executing",
                    required_renewable_pct=65.0,
                    created_at=now - timedelta(hours=1, minutes=30),
                    executed_at=now - timedelta(minutes=30),
                ),
                Job(
                    id=uuid.uuid4(),
                    name="Diffusion Model Checkpoint Evaluation",
                    type="AI Training",
                    energy_requirement=180.0,
                    priority="Low",
                    flexibility="Flexible",
                    deadline=now + timedelta(hours=12),
                    status="Executing",
                    required_renewable_pct=65.0,
                    created_at=now - timedelta(hours=1),
                    executed_at=now - timedelta(minutes=15),
                ),
                Job(
                    id=uuid.uuid4(),
                    name="Cyclone Risk Micro-Climate Simulation",
                    type="Data Processing",
                    energy_requirement=1250.0,
                    priority="High",
                    flexibility="Urgent",
                    deadline=now + timedelta(hours=4),
                    status="Reserved",
                    reserve_reason="Waiting for 12:00 PM peak solar & hydro surplus",
                    required_renewable_pct=0.0,
                    created_at=now - timedelta(minutes=40),
                    expected_execution_time=now + timedelta(minutes=50),
                ),
                Job(
                    id=uuid.uuid4(),
                    name="Multimodal Audio Tokenizer Training",
                    type="AI Training",
                    energy_requirement=670.0,
                    priority="Medium",
                    flexibility="Flexible",
                    deadline=now + timedelta(hours=16),
                    status="Reserved",
                    reserve_reason="Holding for optimal green window (renewables > 85%)",
                    required_renewable_pct=85.0,
                    created_at=now - timedelta(minutes=30),
                    expected_execution_time=now + timedelta(hours=1, minutes=30),
                ),
                Job(
                    id=uuid.uuid4(),
                    name="Genomic Variant Calling Pipeline",
                    type="Data Processing",
                    energy_requirement=950.0,
                    priority="High",
                    flexibility="Urgent",
                    deadline=now - timedelta(hours=1),
                    status="Completed",
                    required_renewable_pct=0.0,
                    created_at=now - timedelta(hours=8),
                    executed_at=now - timedelta(hours=6),
                    completed_at=now - timedelta(hours=2),
                ),
            ]
            db.add_all(sample_jobs)
            db.commit()
            print(f"[Seed] Successfully seeded {len(sample_jobs)} baseline jobs.")

        metric_count = db.query(GridMetric).count()
        if metric_count == 0:
            grid_monitor.set_scenario("Optimal", db=db)
            print("[Seed] Successfully seeded active GridMetric telemetry.")

    except Exception as e:
        db.rollback()
        print(f"[Seed Error] {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB, train/verify ML model, seed baseline data
    init_db()
    seed_database()
    # Trigger model warmup
    _ = forecaster.forecast_24h()
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Carbon-Aware Workload Orchestrator for Odisha Data Centers (GRIDCO/OPTCL parameters)",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "healthy"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
