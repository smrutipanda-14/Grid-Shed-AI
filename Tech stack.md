# Tech Stack & System Architecture — Grid-Shed AI

**Project:** Carbon-Aware Workload Orchestrator for Odisha Data Centers  
**Architecture Style:** Distributed Event-Driven Micro-Architecture (FastAPI + Celery + Redis + React)  

---

## 1. Core Technology Stack

| Layer | Technology | Version / Tools | Purpose & Architectural Rationale |
| :--- | :--- | :--- | :--- |
| **Backend API Gateway** | **Python + FastAPI** | Python 3.11+, FastAPI, Uvicorn | Async REST API handling workload ingestion, live ML carbon forecasts, queue control triggers, and operator dashboard telemetry with auto-generated Swagger docs. |
| **Distributed Task Queue** | **Celery** | Celery 5.4+ | Orchestrates asynchronous compute workloads across dedicated queues (`urgent_realtime` vs. `green_batch`). Supports dynamic runtime queue pausing (`cancel_consumer`), resuming (`add_consumer`), and rate-limiting during coal-heavy grid hours. |
| **Message Broker & State Cache** | **Redis** | Redis 7+ (or Upstash Redis) | Ultra-fast in-memory broker for Celery task routing and real-time cache for the active Odisha grid carbon intensity state (`current_gco2_kwh`). |
| **ML Forecasting Engine** | **LightGBM + Scikit-learn** | `lightgbm`, `scikit-learn`, `joblib`, `pandas`, `numpy` | Lightweight tabular regression model predicting 24-hour Odisha grid carbon intensity ($gCO_2eq/kWh$) in milliseconds on CPU—adhering to **Green AI** low-compute principles. |
| **Database & ORM** | **PostgreSQL (Supabase) + SQLModel** | `sqlmodel`, `psycopg2-binary` | Unifies SQLAlchemy and Pydantic into single Python models to persist historical carbon curves, job execution logs, and cumulative kWh/$CO_2$ savings across FastAPI and Celery workers without Prisma overhead. |
| **Periodic Task Scheduler** | **Celery Beat** | `celery beat` | Built-in Celery scheduler that periodically fetches fresh Odisha weather forecasts and updates the 24-hour carbon intensity predictions in Redis and PostgreSQL. |
| **Weather & Grid Telemetry** | **Open-Meteo API + `httpx`** | `httpx` | Fetches free hourly solar irradiance ($W/m^2$), cloud cover (%), and rainfall data for Bhubaneswar and Sambalpur (Hirakud) with zero API key setup. |
| **Frontend Operator UI** | **React + Tailwind CSS** | React 18+, Vite, Tailwind CSS, Lucide Icons | Operator dashboard for submitting AI batch jobs, inspecting active/paused Celery workers, and triggering live grid simulation scenarios. |
| **Data Visualization** | **Recharts** | `recharts` | Renders interactive dual-axis time-series charts mapping predicted grid carbon intensity against scheduled green-window compute bursts. |

---

## 2. System Data & Execution Flow

1. **Grid Carbon Forecasting (`Celery Beat` + `LightGBM`)**
   * Every hour (or on manual override during live demos), a **Celery Beat** periodic task queries **Open-Meteo** for Odisha solar/weather telemetry.
   * The serialized `.joblib` **LightGBM** regressor predicts hourly carbon intensity ($gCO_2eq/kWh$) for the next 24 hours, storing the forecast curve in **PostgreSQL** and caching the current grid state in **Redis**.
2. **Workload Routing (`FastAPI` + `Redis`)**
   * Incoming jobs submitted via `POST /api/jobs` are classified by priority:
     * `priority="urgent"`: Routed to the `urgent_realtime` queue and executed immediately.
     * `priority="deferrable"`: Routed to the `green_batch` queue in **Redis**.
3. **Carbon-Aware Queue Throttling (`Celery Control API`)**
   * A controller task evaluates the active Odisha carbon intensity against the configured green threshold (e.g., $450\ gCO_2eq/kWh$):
     * **Grid Coal-Heavy ($> 450\ gCO_2eq/kWh$):** Issues `celery_app.control.cancel_consumer("green_batch")`, pausing all deferrable batch workers while keeping urgent jobs running.
     * **Renewable Peak ($\le 450\ gCO_2eq/kWh$):** Issues `celery_app.control.add_consumer("green_batch")`, resuming queued AI training/ETL jobs and logging kWh and $CO_2$ savings to **PostgreSQL**.
4. **Live Operator Dashboard (`React` + `Recharts`)**
   * Polls FastAPI endpoints to visualize real-time grid carbon intensity, active vs. paused Celery worker status, cumulative carbon offsets, and a **Grid Spike Simulator** for live testing.

---

## 3. Repository Structure

```text
grid-shed-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entrypoint & CORS/router setup
│   │   ├── config.py            # Redis URL, Postgres URL & carbon thresholds
│   │   ├── database.py          # SQLModel engine & session management
│   │   ├── models.py            # SQLModel tables (CarbonForecast, ComputeJob, SavingsLog)
│   │   ├── worker/
│   │   │   ├── celery_app.py    # Celery & Celery Beat configuration with Redis broker
│   │   │   ├── tasks.py         # AI workload tasks & periodic forecast refresh tasks
│   │   │   └── controller.py    # Dynamic consumer pause/resume throttling logic
│   │   ├── ml/
│   │   │   ├── train.py         # LightGBM training script on Odisha grid/weather data
│   │   │   ├── predictor.py     # Inference wrapper loading model.joblib
│   │   │   └── model.joblib     # Serialized lightweight regression model
│   │   ├── services/
│   │   │   └── weather.py       # Open-Meteo client for Bhubaneswar/Sambalpur
│   │   └── routes/
│   │       ├── jobs.py          # Job submission & Celery queue inspection endpoints
│   │       └── telemetry.py     # Forecast curves, ESG metrics & simulation overrides
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CarbonChart.jsx  # Recharts 24h intensity vs. compute schedule graph
│   │   │   ├── WorkerStatus.jsx # Live Celery queue state (Active vs. Throttled)
│   │   │   ├── JobQueue.jsx     # Table of urgent & deferred batch jobs
│   │   │   ├── SavingsCard.jsx  # Real-time kWh and gCO2eq reduction KPIs
│   │   │   └── GridSimulator.jsx# Demo toggle to simulate cloud cover / grid spikes
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── TECH_STACK.md