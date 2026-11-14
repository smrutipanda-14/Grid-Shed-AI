import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.db.models import Job, CarbonSaving
from backend.app.schemas.schemas import JobCreate, JobResponse, ReservedJobResponse
from backend.app.services.grid_monitor import grid_monitor
from backend.app.services.scheduler import evaluate_job_scheduling
from backend.app.worker.tasks import execute_job_task

router = APIRouter(prefix="/jobs", tags=["Jobs"])

def serialize_job(job: Job) -> dict:
    created_iso = job.created_at.isoformat() if job.created_at else datetime.now(timezone.utc).isoformat()
    executed_iso = job.executed_at.isoformat() if job.executed_at else None
    completed_iso = job.completed_at.isoformat() if job.completed_at else None
    deadline_iso = job.deadline.isoformat() if job.deadline else datetime.now(timezone.utc).isoformat()
    expected_iso = job.expected_execution_time.isoformat() if job.expected_execution_time else None

    # Calculate saved kg if available
    saved_kg = None
    if job.savings:
        saved_kg = round(sum(s.co2_avoided for s in job.savings) / 1000.0, 1)

    # Progress calculation
    progress = 0
    if job.status in ("Executing", "Running"):
        progress = 45
    elif job.status == "Completed":
        progress = 100

    return {
        "id": str(job.id),
        "name": job.name,
        "type": job.type,
        "energy_requirement": job.energy_requirement,
        "energyRequirement": job.energy_requirement,
        "priority": job.priority,
        "flexibility": job.flexibility,
        "deadline": deadline_iso,
        "status": job.status,
        "reserve_reason": job.reserve_reason,
        "reserveReason": job.reserve_reason,
        "required_renewable_pct": job.required_renewable_pct,
        "expected_execution_time": expected_iso,
        "expectedExecutionTime": expected_iso or "Today, 12:30 PM (Green Window)",
        "created_at": created_iso,
        "submittedAt": created_iso,
        "executed_at": executed_iso,
        "executedAt": executed_iso,
        "completed_at": completed_iso,
        "completedAt": completed_iso,
        "progress": progress,
        "nodesAllocated": max(8, round(job.energy_requirement / 40.0)),
        "carbonSavedKg": saved_kg,
        "co2IntensityAtRun": 145 if job.status in ("Executing", "Completed") else None,
    }

@router.post("", response_model=JobResponse)
def submit_job(job_in: JobCreate, db: Session = Depends(get_db)):
    """
    Submits an AI training or batch data processing workload.
    Applies the autonomous scheduling rules:
    - Immediately dispatches if Urgent, clean grid threshold met, or deadline is near.
    - Otherwise curtails into the Reserve Queue.
    """
    # Resolve energy requirement
    energy = job_in.energy_requirement or job_in.energyRequirement or 450.0
    req_renewable = job_in.required_renewable_pct if job_in.required_renewable_pct is not None else (
        0.0 if job_in.flexibility.capitalize() == "Urgent" else 65.0
    )

    # Parse deadline
    if isinstance(job_in.deadline, str):
        try:
            deadline_dt = datetime.fromisoformat(job_in.deadline.replace("Z", "+00:00"))
        except Exception:
            deadline_dt = datetime.now(timezone.utc)
    else:
        deadline_dt = job_in.deadline

    # Fetch live grid metrics
    live_metric = grid_monitor.get_live_metric(db=db)
    current_renewable = live_metric["renewablePctTotal"]
    current_carbon = live_metric["carbon_intensity"]

    # Evaluate decision
    status, reason, expected_time = evaluate_job_scheduling(
        flexibility=job_in.flexibility,
        deadline=deadline_dt,
        required_renewable_pct=req_renewable,
        current_renewable_pct=current_renewable,
        current_carbon_intensity=current_carbon
    )

    new_job = Job(
        id=uuid.uuid4(),
        name=job_in.name,
        type=job_in.type,
        energy_requirement=energy,
        priority=job_in.priority,
        flexibility=job_in.flexibility,
        deadline=deadline_dt,
        status=status,
        reserve_reason=reason,
        required_renewable_pct=req_renewable,
        expected_execution_time=expected_time,
        created_at=datetime.now(timezone.utc),
        executed_at=datetime.now(timezone.utc) if status == "Executing" else None
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    # If Executing, launch worker task
    if status == "Executing":
        execute_job_task.delay(str(new_job.id))

    return serialize_job(new_job)

@router.get("", response_model=List[JobResponse])
def get_jobs(db: Session = Depends(get_db)):
    """
    Returns all submitted workloads ordered by submission time.
    """
    jobs = db.query(Job).order_by(Job.created_at.desc()).all()
    return [serialize_job(j) for j in jobs]

@router.get("/reserved", response_model=List[ReservedJobResponse])
def get_reserved_jobs(db: Session = Depends(get_db)):
    """
    Returns all workloads currently delayed in the Carbon Reserve Queue.
    """
    reserved = db.query(Job).filter(Job.status.in_(["Reserved", "Pending"])).order_by(Job.created_at.desc()).all()
    live_metric = grid_monitor.get_live_metric(db=db)
    current_renew = live_metric["renewablePctTotal"]

    results = []
    for j in reserved:
        reason = j.reserve_reason or "Held for optimal green window"
        deadline_str = j.deadline.isoformat() if j.deadline else datetime.now(timezone.utc).isoformat()
        expected_str = j.expected_execution_time.isoformat() if j.expected_execution_time else "12:30 PM (in 45m)"
        estimated_avoided = round(j.energy_requirement * 0.28, 1)

        results.append({
            "id": str(j.id),
            "name": j.name,
            "type": j.type,
            "priority": j.priority,
            "deadline": deadline_str,
            "status": "Reserved",
            "reasonForReservation": reason,
            "reserve_reason": reason,
            "currentGridPct": current_renew,
            "requiredGridPct": j.required_renewable_pct,
            "required_renewable_pct": j.required_renewable_pct,
            "predictedExecutionTime": expected_str,
            "expected_execution_time": expected_str,
            "energyKWh": j.energy_requirement,
            "energy_requirement": j.energy_requirement,
            "estimatedAvoidedCO2Kg": estimated_avoided,
        })
    return results
