import os
import math
import numpy as np
import joblib
from pathlib import Path

def generate_synthetic_odisha_data(num_days=90):
    """
    Generates realistic hourly data calibrated to Odisha GRIDCO & OPTCL power grid:
    - High thermal coal baseline (~720 - 820 gCO2/kWh) between 18:00 and 06:00
    - Strong solar PV generation between 09:00 and 15:30 (irradiance up to 900 W/m²)
    - Hirakud / Indravati Hydro dispatch baseline (25-35% diurnal contribution)
    - Carbon drops to 140 - 220 gCO2/kWh during peak green window
    """
    np.random.seed(42)
    rows = []
    
    for day in range(num_days):
        for hour in range(24):
            # Hour cyclic features
            hour_sin = math.sin(2 * math.pi * hour / 24)
            hour_cos = math.cos(2 * math.pi * hour / 24)
            
            # Solar irradiance simulation
            if 6 <= hour <= 18:
                solar_angle = math.sin(math.pi * (hour - 6) / 12)
                irradiance = max(0.0, solar_angle * 880.0 + np.random.normal(0, 30))
                cloud_cover = max(0.0, min(100.0, 15.0 + np.random.normal(0, 10)))
            else:
                irradiance = 0.0
                cloud_cover = max(0.0, min(100.0, 10.0 + np.random.normal(0, 5)))
                
            # Hydro factor (higher during day demand)
            hydro_pct = 20.0 + 15.0 * max(0.0, math.sin(math.pi * (hour - 8) / 14)) + np.random.normal(0, 2)
            hydro_pct = max(15.0, min(40.0, hydro_pct))
            
            # Solar pct based on irradiance
            solar_pct = (irradiance / 880.0) * 55.0 * (1.0 - cloud_cover / 120.0)
            solar_pct = max(0.0, min(65.0, solar_pct))
            
            renewable_pct = solar_pct + hydro_pct
            
            # Carbon intensity calculation: Coal baseline ~820, offset by renewables
            # Renewables replace coal: 1% renewable reduces emissions by ~7.2 gCO2/kWh
            base_coal = 820.0 + np.random.normal(0, 15)
            carbon_intensity = base_coal - (renewable_pct * 7.4)
            carbon_intensity = max(130.0, min(840.0, carbon_intensity))
            
            rows.append({
                "hour": hour,
                "hour_sin": hour_sin,
                "hour_cos": hour_cos,
                "irradiance": irradiance,
                "cloud_cover": cloud_cover,
                "hydro_pct": hydro_pct,
                "carbon_intensity": carbon_intensity,
            })
            
    return rows

def train_and_save_model():
    data = generate_synthetic_odisha_data()
    X = np.array([[r["hour_sin"], r["hour_cos"], r["irradiance"], r["cloud_cover"], r["hydro_pct"]] for r in data])
    y = np.array([r["carbon_intensity"] for r in data])
    
    # Try LightGBM, fallback to HistGradientBoostingRegressor
    try:
        from lightgbm import LGBMRegressor
        model = LGBMRegressor(n_estimators=100, max_depth=5, learning_rate=0.08, random_state=42)
    except ImportError:
        from sklearn.ensemble import HistGradientBoostingRegressor
        model = HistGradientBoostingRegressor(max_iter=100, max_depth=5, learning_rate=0.08, random_state=42)
        
    model.fit(X, y)
    
    output_dir = Path(__file__).parent
    output_path = output_dir / "model.joblib"
    joblib.dump(model, output_path)
    print(f"[ML] Model trained successfully and saved to {output_path}")
    return model

if __name__ == "__main__":
    train_and_save_model()
