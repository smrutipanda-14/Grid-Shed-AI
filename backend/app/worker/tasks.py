import uuid
from datetime import datetime, timezone
from backend.app.core.celery_app import celery_app
from backend.app.core.config import settings
from backend.app.db.session import SessionLocal
from backend.app.db.models import Job, CarbonSaving
from backend.app.services.grid_monitor import grid_monitor
from backend.app.services.scheduler import evaluate_job_scheduling

def dispatch_task(task_func, *args, **kwargs):
    """
    Dispatches task via Celery if Redis broker is reachable,
    otherwise immediately executes synchronously in-process with 0 lag.
    """
    import socket
    is_available = False
    try:
        s = socket.create_connection(("127.0.0.1", 6379), timeout=0.1)
        s.close()
        is_available = True
    except Exception:
        is_available = False

    if is_available:
        try:
            return task_func.apply_async(args=args, kwargs=kwargs, retry=False)
        except Exception:
            return task_func(*args, **kwargs)
    else:
        return task_func(*args, **kwargs)

@celery_app.task(name="backend.app.worker.tasks.execute_job_task")
def execute_job_task(job_id_str: str):
    """
    Simulates task execution for a dispatched job and logs Scope 2 carbon savings.
    """
    db = SessionLocal()
    try:
        job_uuid = uuid.UUID(job_id_str)
        job = db.query(Job).filter(Job.id == job_uuid).first()
        if not job:
            return {"error": f"Job {job_id_str} not found"}

        now = datetime.now(timezone.utc)
        job.status = "Executing"
        job.executed_at = now
        db.commit()

        # Telemetry at execution
        live_metric = grid_monitor.get_live_metric(db=db)
        current_carbon = live_metric["carbon_intensity"]
        baseline_coal = settings.PEAK_COAL_INTENSITY  # 820 gCO2/kWh

        # Carbon accounting (in grams of CO2)
        co2_immediate = round(job.energy_requirement * baseline_coal, 2)
        co2_shifted = round(job.energy_requirement * current_carbon, 2)
        co2_avoided = max(0.0, round(co2_immediate - co2_shifted, 2))

        # Complete job
        job.status = "Completed"
        job.completed_at = datetime.now(timezone.utc)
        db.commit()

        # Log CarbonSaving entry
        saving = CarbonSaving(
            job_id=job.id,
            co2_immediate_exec=co2_immediate,
            co2_shifted_exec=co2_shifted,
            co2_avoided=co2_avoided,
            energy_shifted=job.energy_requirement,
            recorded_at=job.completed_at
        )
        db.add(saving)
        db.commit()

        return {
            "job_id": str(job.id),
            "status": "Completed",
            "co2_avoided_g": co2_avoided,
            "energy_shifted_kwh": job.energy_requirement
        }
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()

@celery_app.task(name="backend.app.worker.tasks.evaluate_reserve_queue_task")
def evaluate_reserve_queue_task():
    """
    Periodic task (run every 30s by Celery Beat and immediately on simulation)
    to audit held workloads in the Reserve Queue against live grid conditions.
    """
    db = SessionLocal()
    promoted_jobs = []
    try:
        reserved_jobs = db.query(Job).filter(Job.status == "Reserved").all()
        if not reserved_jobs:
            return {"status": "ok", "evaluated": 0, "promoted": 0}

        live_metric = grid_monitor.get_live_metric(db=db)
        current_renewable_pct = live_metric["renewablePctTotal"]
        current_carbon = live_metric["carbon_intensity"]

        for job in reserved_jobs:
            new_status, reason, exec_time = evaluate_job_scheduling(
                flexibility=job.flexibility,
                deadline=job.deadline,
                required_renewable_pct=job.required_renewable_pct,
                current_renewable_pct=current_renewable_pct,
                current_carbon_intensity=current_carbon
            )

            if new_status == "Executing":
                job.status = "Executing"
                job.executed_at = datetime.now(timezone.utc)
                job.reserve_reason = f"Promoted: {reason}"
                promoted_jobs.append(str(job.id))
                db.commit()

                # Dispatch execution asynchronously
                dispatch_task(execute_job_task, str(job.id))

        return {"status": "ok", "evaluated": len(reserved_jobs), "promoted": len(promoted_jobs)}
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()

# Provide resilient fallback for .delay() so calling task.delay() never hangs if broker is offline
def _safe_exec_delay(*args, **kwargs):
    return dispatch_task(execute_job_task, *args, **kwargs)

def _safe_eval_delay(*args, **kwargs):
    return dispatch_task(evaluate_reserve_queue_task, *args, **kwargs)

execute_job_task.delay = _safe_exec_delay
evaluate_reserve_queue_task.delay = _safe_eval_delay
