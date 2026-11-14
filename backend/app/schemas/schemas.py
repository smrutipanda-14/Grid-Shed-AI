from datetime import datetime
from typing import List, Optional, Any, Union
from uuid import UUID
from pydantic import BaseModel, Field, model_validator

# ----------------- JOB SCHEMAS -----------------
class JobBase(BaseModel):
    name: str
    type: str  # 'AI Training' | 'Data Processing'
    energy_requirement: float = Field(..., description="Estimated energy in kWh")
    priority: str = Field(default="Medium")  # 'High' | 'Medium' | 'Low'
    flexibility: str = Field(default="Flexible")  # 'Urgent' | 'Flexible'
    deadline: datetime
    required_renewable_pct: Optional[float] = Field(default=None)

class JobCreate(BaseModel):
    name: str
    type: str = "AI Training"
    energy_requirement: Optional[float] = None
    energyRequirement: Optional[float] = None
    priority: str = "Medium"
    flexibility: str = "Flexible"
    deadline: Union[datetime, str]
    required_renewable_pct: Optional[float] = None
    requiredRenewablePct: Optional[float] = None

    @model_validator(mode="before")
    @classmethod
    def resolve_energy(cls, data: Any):
        if isinstance(data, dict):
            if data.get("energy_requirement") is None and data.get("energyRequirement") is not None:
                data["energy_requirement"] = data.get("energyRequirement")
            if data.get("required_renewable_pct") is None and data.get("requiredRenewablePct") is not None:
                data["required_renewable_pct"] = data.get("requiredRenewablePct")
        return data

class JobResponse(BaseModel):
    id: str
    name: str
    type: str
    energy_requirement: float
    energyRequirement: float
    priority: str
    flexibility: str
    deadline: str
    status: str
    reserve_reason: Optional[str] = None
    reserveReason: Optional[str] = None
    required_renewable_pct: float
    expected_execution_time: Optional[str] = None
    expectedExecutionTime: Optional[str] = None
    created_at: str
    submittedAt: str
    executed_at: Optional[str] = None
    executedAt: Optional[str] = None
    completed_at: Optional[str] = None
    completedAt: Optional[str] = None
    progress: int = 0
    nodesAllocated: int = 16
    carbonSavedKg: Optional[float] = None
    co2IntensityAtRun: Optional[float] = None

    class Config:
        from_attributes = True

class ReservedJobResponse(BaseModel):
    id: str
    name: str
    type: str
    priority: str
    deadline: str
    status: str = "Reserved"
    reasonForReservation: str
    reserve_reason: str
    currentGridPct: float
    requiredGridPct: float
    required_renewable_pct: float
    predictedExecutionTime: str
    expected_execution_time: Optional[str] = None
    energyKWh: float
    energy_requirement: float
    estimatedAvoidedCO2Kg: float

    class Config:
        from_attributes = True

# ----------------- GRID TELEMETRY SCHEMAS -----------------
class GridMixItem(BaseModel):
    name: str
    value: float
    mw: float
    color: str
    icon: str

class GridWeatherInfo(BaseModel):
    condition: str
    tempC: float
    humidity: int
    cloudCoverPct: int
    irradianceWM2: float
    irradianceStatus: str
    irradianceSparkline: List[float]
    hydroHeadMeters: float
    hydroCapacityPct: float
    hydroInflowRate: str
    hydroHeadSparkline: List[float]

class GridMetricResponse(BaseModel):
    id: Optional[str] = None
    timestamp: str
    carbon_intensity: float
    currentCarbonIntensity: float
    carbonThreshold: float = 250.0
    carbonIntensityDelta: float = -18.4
    grid_frequency: float = 50.02
    gridFrequency: float = 50.02
    frequencyStatus: str = "Stable"
    grid_status: str = "Optimal"
    gridStatus: str = "Optimal"
    totalGridLoadMW: float = 4280.0
    dataCenterDrawMW: float = 142.5
    renewablePctTotal: float
    solar_pct: float
    hydro_pct: float
    pumped_storage_pct: float
    thermal_pct: float
    mix: List[GridMixItem]
    weather: GridWeatherInfo

class TimelinePoint(BaseModel):
    hour: str
    carbon: float
    renewablePct: float
    isGreenWindow: bool
    solar: float
    hydro: float
    thermal: float
    timestamp: Optional[str] = None

class GridSimulateRequest(BaseModel):
    scenario: str = Field(..., description="'Optimal' | 'Moderate' | 'Constrained' or 'SOLAR_PEAK' | 'COAL_SPIKE'")

# ----------------- ANALYTICS SCHEMAS -----------------
class JobComparisonItem(BaseModel):
    name: str
    immediateKg: float
    shiftedKg: float
    avoidedKg: float
    savingsPct: float

class DailySavingsTrendItem(BaseModel):
    day: str
    immediateTotalKg: float
    shiftedTotalKg: float
    avoidedKg: float

class CarbonSavingsSummaryResponse(BaseModel):
    totalCO2AvoidedTonnes: float
    totalCO2AvoidedDeltaPct: float
    energyShiftedMWh: float
    rescheduledJobsCount: int
    averageShiftDelayHours: float
    treesEquivalent: int
    electricCarKmAvoided: int
    jobComparisonData: List[JobComparisonItem]
    dailySavingsTrend: List[DailySavingsTrendItem]
