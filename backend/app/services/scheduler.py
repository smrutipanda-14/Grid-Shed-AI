from datetime import datetime, timezone, timedelta
from typing import Tuple, Optional
from backend.app.core.config import settings

def evaluate_job_scheduling(
    flexibility: str,
    deadline: datetime,
    required_renewable_pct: float,
    current_renewable_pct: float,
    current_carbon_intensity: float,
    carbon_threshold: float = settings.CARBON_THRESHOLD
) -> Tuple[str, Optional[str], Optional[datetime]]:
    """
    Implements the PRD AI Decision Engine rules:
    - Rule 1 (EXECUTE NOW):
        - flexibility == 'Urgent', OR
        - renewable_pct >= required_renewable_pct AND carbon_intensity <= carbon_threshold, OR
        - deadline is within 2 hours ((deadline - now).total_seconds() <= 7200)
    - Rule 2 (RESERVE):
        - Otherwise, status = 'Reserved' with explicit reserve_reason and expected_execution_time.

    Returns:
        (status, reserve_reason, expected_execution_time)
        status is either 'Executing' or 'Reserved'
    """
    now = datetime.now(timezone.utc)
    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)

    time_to_deadline_sec = (deadline - now).total_seconds()
    is_urgent = flexibility.strip().capitalize() == "Urgent"
    is_deadline_critical = time_to_deadline_sec <= 7200  # within 2 hours
    is_clean_grid = (current_renewable_pct >= required_renewable_pct) and (current_carbon_intensity <= carbon_threshold)

    if is_urgent:
        return "Executing", "Dispatched immediately (Urgent priority bypass)", now

    if is_deadline_critical:
        return "Executing", "Dispatched immediately (SLA deadline within 2 hours)", now

    if is_clean_grid:
        return "Executing", f"Dispatched immediately (Clean grid: {current_renewable_pct:.1f}% renewables >= required {required_renewable_pct:.1f}%)", now

    # Rule 2: Hold back in Reserve Queue
    reason = (
        f"Grid renewable share {current_renewable_pct:.1f}% < required {required_renewable_pct:.1f}% "
        f"(Carbon: {current_carbon_intensity:.0f} gCO2/kWh > cap {carbon_threshold:.0f})"
    )
    # Estimate next green window (typically 11:30 - 13:00)
    expected_time = now + timedelta(minutes=45)
    return "Reserved", reason, expected_time
