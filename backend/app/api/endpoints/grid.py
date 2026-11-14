from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.schemas.schemas import GridMetricResponse, TimelinePoint, GridSimulateRequest
from backend.app.services.grid_monitor import grid_monitor
from backend.app.ml.predictor import forecaster
from backend.app.worker.tasks import evaluate_reserve_queue_task

router = APIRouter(prefix="/grid", tags=["Grid Telemetry"])

@router.get("/live", response_model=GridMetricResponse)
def get_live_grid(db: Session = Depends(get_db)):
    """
    Returns real-time Odisha OPTCL / GRIDCO power grid metrics.
    Includes generation mix (Solar, Hydro, Pumped, Coal), frequency, and weather.
    """
    return grid_monitor.get_live_metric(db=db)

@router.get("/forecast", response_model=List[TimelinePoint])
def get_grid_forecast():
    """
    Returns 24-hour ahead hourly carbon intensity forecast predicted by LightGBM.
    Highlights daytime solar & hydro peak green windows.
    """
    return forecaster.forecast_24h()

@router.post("/simulate", response_model=GridMetricResponse)
def simulate_grid_state(sim_in: GridSimulateRequest, db: Session = Depends(get_db)):
    """
    Interactive Demo Trigger:
    Instantly shifts Odisha grid state between:
    - 'Optimal' (Solar surge / 92% renewables / 138 gCO2)
    - 'Moderate' (Afternoon cloud cover / 58% renewables / 310 gCO2)
    - 'Constrained' (Night peak / coal thermal spike / 620 gCO2)

    Immediately triggers re-evaluation of the Reserved Queue to promote/curtail jobs.
    """
    updated_metric = grid_monitor.set_scenario(sim_in.scenario, db=db)
    
    # Trigger immediate evaluation of held jobs in the reserve queue
    evaluate_reserve_queue_task.delay()

    return updated_metric
