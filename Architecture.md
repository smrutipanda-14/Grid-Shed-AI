# System Architecture — Grid-Shed AI

**Project:** Carbon-Aware Workload Orchestrator for Odisha Data Centers  
**Location Context:** Bhubaneswar / Odisha Regional Power Grid (GRIDCO / OPTCL)  
**Architecture Pattern:** Event-Driven Distributed Task Orchestration with Predictive ML Control Loop  

---

## 1. High-Level System Architecture Diagram

```text
+---------------------------------------------------------------------------------------------------+
|                                   EXTERNAL DATA & GRID SIGNALS                                    |
|                                                                                                   |
|   +---------------------------------------------+   +-----------------------------------------+   |
|   |        Open-Meteo Weather API               |   |   Odisha Grid Baseline & Simulator      |   |
|   |  (Bhubaneswar & Sambalpur Solar/Cloud Data) |   | (GRIDCO/OPTCL Coal/Hydro/Solar Profile) |   |
|   +----------------------+----------------------+   +--------------------+--------------------+   |
+--------------------------|-----------------------------------------------|------------------------+
                           | Hourly Weather Forecast (httpx)               | Live / Demo Override
                           v                                               v
+---------------------------------------------------------------------------------------------------+
|                                  ML CARBON INTENSITY FORECASTER                                   |
|                                                                                                   |
|   +-------------------------------------------------------------------------------------------+   |
|   |  LightGBM Tabular Regressor (model.joblib)                                                |   |
|   |  Inputs: hour_sin, hour_cos, shortwave_radiation (W/m²), cloud_cover (%), hydro_season    |   |
|   |  Output: 24-Hour Grid Carbon Intensity Curve (gCO2eq/kWh)                                 |   |
|   +---------------------------------------------+---------------------------------------------+   |
+-------------------------------------------------|-------------------------------------------------+
                                                  | Writes 24h Forecast & Active Grid State
                                                  v
+-----------------------------------+   +-----------------------------------------------------------+
|      POSTGRESQL (SQLModel)        |   |                  REDIS (BROKER & CACHE)                   |
|                                   |   |                                                           |
|  - carbon_forecasts (24h series)  |   |  - Cache: current_gco2_kwh, green_threshold, queue_state  |
|  - compute_jobs (audit & status)  |   |  - Queue 1: [ urgent_realtime ]  (Always Active)          |
|  - grid_state (active thresholds) |   |  - Queue 2: [ green_batch ]      (Dynamically Throttled)  |
+-----------------^-----------------+   +---------+-------------------------------+-----------------+
                  |                               |                               |
                  | Read/Write                    | Consume Always                | Pause / Resume
                  | Telemetry & Logs              v                               v
+-----------------|-----------------+   +-----------------------------------------------------------+
|      FASTAPI BACKEND GATEWAY      |   |               CELERY DISTRIBUTED WORKER POOL              |
|                                   |   |                                                           |
|  - POST /api/jobs (Task Router)   |   |  +-----------------------------------------------------+  |
|  - GET  /api/telemetry (Metrics)  |   |  | Celery Beat & Carbon-Aware Control Loop (30s)       |  |
|  - POST /api/simulate (Demo Hook) |   |  |  - If Carbon > 450 g: cancel_consumer("green_batch")  |  |
|                                   |   |  |  - If Carbon <= 450 g: add_consumer("green_batch")    |  |
+-----------------^-----------------+   |  +-----------------------------------------------------+  |
                  |                     |                                                           |
                  | REST Polling (2s)   |  +-------------------------+  +------------------------+  |
                  |                     |  | Urgent Worker Thread    |  | Green Batch Worker     |  |
                  |                     |  | (APIs, Live Inference)  |  | (LLM Tune, ETL, Render)|  |
                  |                     |  +-------------------------+  +------------------------+  |
                  |                     +-----------------------------------------------------------+
+-----------------|---------------------------------------------------------------------------------+
|                 v                       OPERATOR DASHBOARD                                        |
|  +---------------------------------------------------------------------------------------------+  |
|  |  React + Tailwind CSS + Recharts                                                            |  |
|  |  [KPI Cards: gCO2/kWh & Savings]  [24h Carbon Forecast Chart]  [Queue Monitor & Simulator]  |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+