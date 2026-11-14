import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Grid-Shed AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./grid_shed.db")
    
    # Redis / Celery
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
    
    # Grid & Carbon Guardrails (Odisha GRIDCO/OPTCL baseline)
    CARBON_THRESHOLD: float = float(os.getenv("CARBON_THRESHOLD", "250.0"))  # gCO2/kWh
    RENEWABLE_THRESHOLD: float = float(os.getenv("RENEWABLE_THRESHOLD", "65.0"))  # % clean energy
    PEAK_COAL_INTENSITY: float = float(os.getenv("PEAK_COAL_INTENSITY", "820.0"))  # gCO2/kWh
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
