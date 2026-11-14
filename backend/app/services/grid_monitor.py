import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.db.models import GridMetric

# Deterministic Odisha GRIDCO/OPTCL Presets
SCENARIOS = {
    "Optimal": {
        "carbon_intensity": 138.0,
        "solar_pct": 48.0,
        "hydro_pct": 34.0,
        "pumped_storage_pct": 10.0,
        "thermal_pct": 8.0,
        "grid_frequency": 50.04,
        "grid_status": "Optimal",
        "weather_condition": "Optimal Solar / Clear",
        "solar_irradiance": 880.0,
        "hydro_reservoir_head": 192.5,
        "delta": -32.5,
        "data_center_draw_mw": 142.5,
        "total_grid_load_mw": 4350.0,
    },
    "Moderate": {
        "carbon_intensity": 310.0,
        "solar_pct": 20.0,
        "hydro_pct": 26.0,
        "pumped_storage_pct": 12.0,
        "thermal_pct": 42.0,
        "grid_frequency": 49.97,
        "grid_status": "Moderate",
        "weather_condition": "Monsoon Overcast / Scattered Showers",
        "solar_irradiance": 340.0,
        "hydro_reservoir_head": 191.8,
        "delta": 12.4,
        "data_center_draw_mw": 142.5,
        "total_grid_load_mw": 4120.0,
    },
    "Constrained": {
        "carbon_intensity": 620.0,
        "solar_pct": 2.0,
        "hydro_pct": 14.0,
        "pumped_storage_pct": 6.0,
        "thermal_pct": 78.0,
        "grid_frequency": 49.88,
        "grid_status": "Constrained",
        "weather_condition": "Night Peak / Heavy Coal Base Load",
        "solar_irradiance": 0.0,
        "hydro_reservoir_head": 190.5,
        "delta": 48.2,
        "data_center_draw_mw": 142.5,
        "total_grid_load_mw": 4890.0,
    }
}

# Alias mapping for alternate demo triggers
SCENARIO_ALIASES = {
    "SOLAR_PEAK": "Optimal",
    "OPTIMAL": "Optimal",
    "MODERATE": "Moderate",
    "COAL_SPIKE": "Constrained",
    "CONSTRAINED": "Constrained"
}

class GridMonitorService:
    def __init__(self):
        self.active_scenario = "Optimal"
        self._cached_metric = None

    def get_live_metric(self, db: Optional[Session] = None) -> Dict[str, Any]:
        """
        Returns rich live telemetry formatted for the frontend dashboard.
        """
        # Fetch from DB if available, else use active scenario
        db_metric = None
        if db:
            db_metric = db.query(GridMetric).filter(GridMetric.is_forecast == False).order_by(GridMetric.timestamp.desc()).first()

        preset = SCENARIOS.get(self.active_scenario, SCENARIOS["Optimal"])

        if db_metric:
            carbon = db_metric.carbon_intensity
            solar = db_metric.solar_pct
            hydro = db_metric.hydro_pct
            pumped = db_metric.pumped_storage_pct
            thermal = db_metric.thermal_pct
            freq = db_metric.grid_frequency
            status = db_metric.grid_status
            weather_cond = db_metric.weather_condition
            irradiance = db_metric.solar_irradiance
            head = db_metric.hydro_reservoir_head
            timestamp_str = db_metric.timestamp.isoformat()
        else:
            carbon = preset["carbon_intensity"]
            solar = preset["solar_pct"]
            hydro = preset["hydro_pct"]
            pumped = preset["pumped_storage_pct"]
            thermal = preset["thermal_pct"]
            freq = preset["grid_frequency"]
            status = preset["grid_status"]
            weather_cond = preset["weather_condition"]
            irradiance = preset["solar_irradiance"]
            head = preset["hydro_reservoir_head"]
            timestamp_str = datetime.now(timezone.utc).isoformat()

        renewable_total = round(solar + hydro + pumped, 1)
        total_load = preset["total_grid_load_mw"]

        mix = [
            {"name": "Solar PV", "value": round(solar), "mw": round(total_load * (solar / 100)), "color": "#00ff87", "icon": "Sun"},
            {"name": "Hydroelectric", "value": round(hydro), "mw": round(total_load * (hydro / 100)), "color": "#00f0ff", "icon": "Droplets"},
            {"name": "Pumped Storage", "value": round(pumped), "mw": round(total_load * (pumped / 100)), "color": "#38bdf8", "icon": "BatteryCharging"},
            {"name": "Thermal (Coal/Gas)", "value": round(thermal), "mw": round(total_load * (thermal / 100)), "color": "#f59e0b", "icon": "Flame"},
        ]

        weather = {
            "condition": weather_cond,
            "tempC": 31.5 if status == "Optimal" else 28.0,
            "humidity": 48 if status == "Optimal" else 75,
            "cloudCoverPct": 12 if status == "Optimal" else 65,
            "irradianceWM2": irradiance,
            "irradianceStatus": "Peak Generation" if irradiance > 600 else "Sub-optimal",
            "irradianceSparkline": [120, 280, 490, 680, 790, 842, 850, 810, 690, 520, 310, 90],
            "hydroHeadMeters": head,
            "hydroCapacityPct": 94.2,
            "hydroInflowRate": "1,420 m³/s",
            "hydroHeadSparkline": [191.8, 191.9, 192.0, 192.1, 192.2, 192.3, 192.4, 192.4, 192.5, 192.4],
        }

        return {
            "timestamp": timestamp_str,
            "carbon_intensity": carbon,
            "currentCarbonIntensity": carbon,
            "carbonThreshold": settings.CARBON_THRESHOLD,
            "carbonIntensityDelta": preset["delta"],
            "grid_frequency": freq,
            "gridFrequency": freq,
            "frequencyStatus": "Stable" if 49.95 <= freq <= 50.05 else "Fluctuating",
            "grid_status": status,
            "gridStatus": status,
            "totalGridLoadMW": total_load,
            "dataCenterDrawMW": preset["data_center_draw_mw"],
            "renewablePctTotal": renewable_total,
            "solar_pct": solar,
            "hydro_pct": hydro,
            "pumped_storage_pct": pumped,
            "thermal_pct": thermal,
            "mix": mix,
            "weather": weather,
        }

    def set_scenario(self, scenario_name: str, db: Session) -> Dict[str, Any]:
        """
        Updates the active telemetry scenario and persists the new GridMetric row in DB.
        """
        normalized = SCENARIO_ALIASES.get(scenario_name.upper(), scenario_name)
        if normalized not in SCENARIOS:
            normalized = "Optimal"

        self.active_scenario = normalized
        preset = SCENARIOS[normalized]

        new_metric = GridMetric(
            timestamp=datetime.now(timezone.utc),
            carbon_intensity=preset["carbon_intensity"],
            solar_pct=preset["solar_pct"],
            hydro_pct=preset["hydro_pct"],
            pumped_storage_pct=preset["pumped_storage_pct"],
            thermal_pct=preset["thermal_pct"],
            grid_frequency=preset["grid_frequency"],
            grid_status=preset["grid_status"],
            weather_condition=preset["weather_condition"],
            solar_irradiance=preset["solar_irradiance"],
            hydro_reservoir_head=preset["hydro_reservoir_head"],
            is_forecast=False
        )

        db.add(new_metric)
        db.commit()
        db.refresh(new_metric)

        return self.get_live_metric(db=db)

grid_monitor = GridMonitorService()
