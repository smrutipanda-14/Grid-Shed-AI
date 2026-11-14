import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean, Text, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # 'AI Training' | 'Data Processing'
    energy_requirement = Column(Float, nullable=False)  # kWh
    priority = Column(String(20), nullable=False, default="Medium")  # 'High' | 'Medium' | 'Low'
    flexibility = Column(String(20), nullable=False, default="Flexible")  # 'Urgent' | 'Flexible'
    deadline = Column(DateTime, nullable=False)  # SLA completion deadline (UTC)
    status = Column(String(20), nullable=False, default="Reserved")  # 'Executing' | 'Reserved' | 'Completed' | 'Failed'
    reserve_reason = Column(Text, nullable=True)
    required_renewable_pct = Column(Float, nullable=False, default=65.0)
    expected_execution_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    executed_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    savings = relationship("CarbonSaving", back_populates="job", cascade="all, delete-orphan")


class GridMetric(Base):
    __tablename__ = "grid_metrics"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime, nullable=False, index=True)
    carbon_intensity = Column(Float, nullable=False)  # gCO2/kWh
    solar_pct = Column(Float, nullable=False)
    hydro_pct = Column(Float, nullable=False)
    pumped_storage_pct = Column(Float, nullable=False, default=0.0)
    thermal_pct = Column(Float, nullable=False)
    grid_frequency = Column(Float, nullable=False, default=50.00)
    grid_status = Column(String(20), nullable=False, default="Optimal")  # 'Optimal' | 'Moderate' | 'Constrained'
    weather_condition = Column(String(100), nullable=False, default="Optimal Solar / Clear")
    solar_irradiance = Column(Float, nullable=False, default=800.0)  # W/m²
    hydro_reservoir_head = Column(Float, nullable=False, default=192.0)  # meters (Hirakud)
    is_forecast = Column(Boolean, nullable=False, default=False)


class CarbonSaving(Base):
    __tablename__ = "carbon_savings"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(Uuid(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    co2_immediate_exec = Column(Float, nullable=False)  # gCO2
    co2_shifted_exec = Column(Float, nullable=False)  # gCO2
    co2_avoided = Column(Float, nullable=False)  # co2_immediate_exec - co2_shifted_exec
    energy_shifted = Column(Float, nullable=False)  # kWh
    recorded_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    job = relationship("Job", back_populates="savings")
