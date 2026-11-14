# Master Project Requirement Document (PRD): Grid-Shed AI

**Project:** Carbon-Aware Workload Orchestrator for Odisha Data Centers  
**Target Timeline:** 24-Hour Hackathon MVP  
**Architecture Style:** Python-Native Distributed Task Orchestrator (FastAPI + Celery + Redis + PostgreSQL + LightGBM + React)  

---

## 1. Project Overview & Scope Guardrails
**Grid-Shed AI** is a carbon-aware workload orchestrator built for Odisha's expanding green IT and AI data center parks. It monitors real-time carbon intensity and renewable energy mix across the Odisha power grid (GRIDCO/OPTCL parameters: Solar, Hydro, Pumped Storage, Thermal, and 50Hz grid frequency) and dynamically schedules delay-tolerant AI training and data processing jobs during low-carbon renewable peaks.

### 24-Hour Hackathon Design Decisions (Single Source of Truth)
* **Deadline-Aware DB Queue (No Complex Consumer Canceling):** Flexible jobs that miss the renewable threshold are persisted in PostgreSQL with `status = 'Reserved'`. A **Celery Beat** periodic task re-evaluates the `Reserved` queue every 30–60 seconds (and immediately on manual simulation triggers) to promote jobs to `Executing` when renewable share rises OR when a job's deadline becomes imminent.
* **Lightweight Green AI Forecaster:** Uses a fast CPU-trained `LightGBM` / `Scikit-learn` regression model (`model.joblib`) paired with a deterministic GRIDCO/OPTCL telemetry simulator (with optional Open-Meteo solar irradiance enrichment) so live demos never stall on external API timeouts.
* **Instant Demo Override (`POST /api/grid/simulate`):** Includes an interactive simulator bar on the main dashboard allowing presenters to toggle between **Optimal Solar Peak**, **Moderate Hydro/Thermal**, and **Constrained Coal Spike** to trigger live queue transitions in under 2 seconds.
* **Zero Setup Bloat:** Uses **SQLAlchemy / SQLModel** (no Prisma), simple React hooks + 3-second polling (no Redux/Zustand), and local native execution (no Docker required during the sprint).

---

## 2. Finalized Tech Stack

| Layer | Technology | Purpose & Role |
| :--- | :--- | :--- |
| **Frontend UI** | **React (Vite) + Tailwind CSS + Recharts + Lucide React** | Dark eco-themed 4-page operator console with 3-second live polling and interactive data visualizations. |
| **Backend API** | **Python 3.11+ + FastAPI + Uvicorn** | Async REST API for workload submission, AI scheduling decisions, telemetry feeds, and grid simulation triggers. |
| **Task Queue & Broker** | **Celery + Celery Beat + Redis** | Executes background AI/ETL jobs and runs the periodic `Reserved` queue re-evaluation loop (`worker_prefetch_multiplier=1`). |
| **ML Forecasting** | **Scikit-learn / LightGBM + `joblib` + `numpy`** | Lightweight tabular regressor predicting 24-hour grid carbon intensity ($gCO_2eq/kWh$) in milliseconds on CPU. |
| **Database & ORM** | **PostgreSQL (or SQLite fallback) + SQLAlchemy** | Persists jobs, time-series Odisha grid telemetry, and verified Scope 2 carbon savings. |

---

## 3. Unified Database Schema (SQLAlchemy Models)

All backend services, Celery workers, and API routes share these exact three tables:

### Table 1: `jobs` (`Job`)
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key (auto-generated) |
| `name` | `String` | e.g., `"Indic-LLM Fine-Tuning v2"` |
| `type` | `String` | `'AI Training'` \| `'Data Processing'` |
| `energy_requirement` | `Float` | Estimated energy in `kWh` (e.g., `12.5`) |
| `priority` | `String` | `'High'` \| `'Medium'` \| `'Low'` |
| `flexibility` | `String` | `'Urgent'` \| `'Flexible'` |
| `deadline` | `DateTime` | SLA completion deadline (UTC) |
| `status` | `String` | `'Executing'` \| `'Reserved'` \| `'Completed'` \| `'Failed'` |
| `reserve_reason` | `Text` | Nullable; e.g., `"Grid renewable share 38% < required 65%"` |
| `required_renewable_pct` | `Float` | Minimum clean energy % required (default `65.0` for Flexible, `0.0` for Urgent) |
| `expected_execution_time` | `DateTime` | Nullable; predicted next green window timestamp |
| `created_at` | `DateTime` | Timestamp of submission |
| `executed_at` | `DateTime` | Nullable; timestamp when worker began execution |
| `completed_at` | `DateTime` | Nullable; timestamp when job finished |

### Table 2: `grid_metrics` (`GridMetric`)
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key |
| `timestamp` | `DateTime` | Indexed timestamp (covers past 24h + 24h ML forecast) |
| `carbon_intensity` | `Float` | Grid emissions in `gCO2/kWh` (range: `280` to `840`) |
| `solar_pct` | `Float` | Odisha solar generation share (`%`) |
| `hydro_pct` | `Float` | Hirakud / Indravati hydro share (`%`) |
| `pumped_storage_pct` | `Float` | Upper Indravati / regional pumped storage share (`%`) |
| `thermal_pct` | `Float` | Ib Valley / Talcher coal thermal share (`%`) |
| `grid_frequency` | `Float` | Nominal `50.00 Hz` (range `49.85` – `50.15`) |
| `grid_status` | `String` | `'Optimal'` \| `'Moderate'` \| `'Constrained'` |
| `weather_condition` | `String` | e.g., `'Clear Sky'`, `'Partly Cloudy'`, `'Monsoon Overcast'` |
| `solar_irradiance` | `Float` | Solar irradiance in `W/m²` |
| `hydro_reservoir_head` | `Float` | Reservoir water level in meters (e.g., `191.4`) |
| `is_forecast` | `Boolean` | `False` for current/historical telemetry, `True` for ML forecast |

### Table 3: `carbon_savings` (`CarbonSaving`)
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key |
| `job_id` | `UUID` | Foreign Key $\rightarrow$ `jobs.id` |
| `co2_immediate_exec` | `Float` | Estimated `gCO2` if executed at submission time |
| `co2_shifted_exec` | `Float` | Actual `gCO2` emitted during shifted execution window |
| `co2_avoided` | `Float` | Net `gCO2` saved (`co2_immediate_exec - co2_shifted_exec`) |
| `energy_shifted` | `Float` | Clean energy consumed (`kWh`) |
| `recorded_at` | `DateTime` | Completion timestamp |

---
## 4. Unified Repository Structure

> **Agent Instruction:** `frontend/` is already built and complete. Do **not** overwrite existing `components/`, `pages/`, or `utils/`. Inspect `frontend/src/data/` to match exact JSON field names, and replace static mock imports with API calls to `http://localhost:8000/api`.

grid-shed-ai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── jobs.py          # POST /api/jobs, GET /api/jobs, GET /api/jobs/reserved
│   │   │   │   ├── grid.py          # GET /api/grid/live, GET /api/grid/forecast, POST /api/grid/simulate
│   │   │   │   └── analytics.py     # GET /api/analytics/savings
│   │   │   └── router.py            # Aggregates all /api routes
│   │   ├── core/
│   │   │   ├── config.py            # DB URL, Redis URL, carbon thresholds
│   │   │   └── celery_app.py        # Celery + Celery Beat config (prefetch=1)
│   │   ├── db/
│   │   │   ├── session.py           # SQLAlchemy engine & SessionLocal
│   │   │   └── models.py            # Job, GridMetric, CarbonSaving tables
│   │   ├── ml/
│   │   │   ├── train.py             # Generates Odisha synthetic data & trains LightGBM
│   │   │   ├── predictor.py         # Loads model.joblib to forecast 24h carbon curve
│   │   │   └── model.joblib         # Pre-trained lightweight regression model
│   │   ├── schemas/
│   │   │   └── schemas.py           # Pydantic request/response models matching frontend/src/data/
│   │   ├── services/
│   │   │   ├── scheduler.py         # AI Decision Engine (EXECUTE NOW vs. RESERVE)
│   │   │   └── grid_monitor.py      # GRIDCO/OPTCL Odisha telemetry & scenario generator
│   │   ├── worker/
│   │   │   └── tasks.py             # execute_job_task & evaluate_reserve_queue_task
│   │   └── main.py                  # FastAPI app, CORS (localhost:5173), startup DB seeding
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/              # Existing UI & Recharts components (DO NOT OVERWRITE)
│   │   ├── data/                    # Existing mock data -> replace with FastAPI fetch wrappers
│   │   ├── pages/                   # Existing 4 pages (Dashboard, JobManagement, ReserveQueue, CarbonSavings)
│   │   ├── utils/                   # Existing date/percentage helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── package.json
└── PRD.md