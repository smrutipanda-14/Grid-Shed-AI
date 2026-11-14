import os
import math
from pathlib import Path
from typing import List, Dict, Any
import numpy as np
import joblib

MODEL_PATH = Path(__file__).parent / "model.joblib"

class CarbonForecaster:
    def __init__(self):
        self.model = None
        self._load_or_train()

    def _load_or_train(self):
        if MODEL_PATH.exists():
            try:
                self.model = joblib.load(MODEL_PATH)
            except Exception as e:
                print(f"[ML] Error loading model: {e}. Retraining...")
                self._train_fallback()
        else:
            self._train_fallback()

    def _train_fallback(self):
        from backend.app.ml.train import train_and_save_model
        self.model = train_and_save_model()

    def predict_point(self, hour: int, irradiance: float, cloud_cover: float, hydro_pct: float) -> float:
        hour_sin = math.sin(2 * math.pi * hour / 24)
        hour_cos = math.cos(2 * math.pi * hour / 24)
        X = np.array([[hour_sin, hour_cos, irradiance, cloud_cover, hydro_pct]])
        if self.model:
            pred = self.model.predict(X)[0]
            return float(max(130.0, min(840.0, pred)))
        # Fallback formula
        base = 820.0 - (irradiance * 0.45) - (hydro_pct * 4.5)
        return float(max(130.0, min(840.0, base)))

    def forecast_24h(self) -> List[Dict[str, Any]]:
        """
        Forecasts next 24 hours of Odisha grid carbon intensity and renewable generation.
        Returns timeline points formatted for CarbonTimelineChart.
        """
        points = []
        for h in range(24):
            hour_str = f"{h:02d}:00"
            
            # Solar generation curve (peaking at 12:00)
            if 6 <= h <= 18:
                solar_angle = math.sin(math.pi * (h - 6) / 12)
                irradiance = max(0.0, solar_angle * 850.0)
                cloud_cover = 12.0
                solar_pct = round((irradiance / 850.0) * 58.0)
            else:
                irradiance = 0.0
                cloud_cover = 10.0
                solar_pct = 0
                
            # Hydro baseline
            if 10 <= h <= 16:
                hydro_pct = 34
            elif 7 <= h <= 21:
                hydro_pct = 28
            else:
                hydro_pct = 18
                
            carbon = round(self.predict_point(h, irradiance, cloud_cover, hydro_pct))
            renewable_pct = min(95, solar_pct + hydro_pct)
            thermal_pct = max(5, 100 - renewable_pct)
            
            # Green window: carbon < 220 gCO2/kWh and renewable >= 75%
            is_green_window = (10 <= h <= 15) or (carbon < 220 and renewable_pct >= 75)
            
            points.append({
                "hour": hour_str,
                "carbon": carbon,
                "renewablePct": renewable_pct,
                "isGreenWindow": is_green_window,
                "solar": solar_pct,
                "hydro": hydro_pct,
                "thermal": thermal_pct,
            })
            
        return points

forecaster = CarbonForecaster()
