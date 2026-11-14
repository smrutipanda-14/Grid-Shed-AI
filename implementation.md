# Product Implementation Plan — Grid-Shed AI (24-Hour Hackathon Sprint)

**Project:** Carbon-Aware Workload Orchestrator for Odisha Data Centers  
**Stack:** Python + FastAPI + Celery + Redis + PostgreSQL (SQLModel) + LightGBM + React (Tailwind + Recharts)  
**Target Timeline:** 24 Hours (End-to-End MVP + Live Interactive Demo)  

---

## 1. Sprint Architecture & Scope Strategy

To deliver a working distributed orchestrator within 24 hours, the implementation prioritizes **live end-to-end orchestration** over heavy data engineering:
* **Broker & Queue Isolation:** Two dedicated Redis-backed Celery queues (`urgent_realtime` and `green_batch`) with `worker_prefetch_multiplier=1` so queue throttling takes effect immediately without buffered task leakage.
* **Weather-Driven Carbon Predictor:** Uses live hourly solar irradiance (`shortwave_radiation`) and `cloud_cover` from the Open-Meteo API for Bhubaneswar (`20.2961° N, 85.8245° E`) combined with Odisha's thermal/hydro diurnal baseline.
* **Live Judge Demo Hook:** Includes a `POST /api/simulate` override endpoint so presenters can trigger a "Cloud Cover / Coal Spike" or "Peak Solar Window" on demand and watch Celery pause/resume batch workloads in real time.

---

## 2. Phase-by-Phase 24-Hour Execution Roadmap

### Phase 1: Infrastructure & Boilerplate (Hours 0–2)
* **Goals:**
  * Provision Redis (local `redis-server` or managed Upstash Redis URL) and PostgreSQL (Supabase or local Postgres).
  * Initialize repository structure (`backend/` and `frontend/`) and install Python/Node dependencies.
  * Configure `SQLModel` database connection and create 3 core tables:
    * `CarbonForecast`: `id`, `timestamp`, `solar_irradiance`, `cloud_cover`, `predicted_gco2_kwh`, `is_green_window`
    * `ComputeJob`: `id`, `celery_task_id`, `name`, `priority` (`urgent` | `deferrable`), `status` (`QUEUED` | `PAUSED_HIGH_CARBON` | `RUNNING` | `COMPLETED`), `estimated_kwh`, `carbon_saved_g`, `created_at`, `completed_at`
    * `GridState`: `id`, `current_gco2_kwh`, `threshold_gco2_kwh`, `is_throttled`, `simulation_mode`, `updated_at`
* **Milestone Check:** A test Celery task dispatched from a FastAPI route executes via Redis and writes a row to PostgreSQL.

---

### Phase 2: Lightweight ML Carbon Intensity Predictor (Hours 2–5)
* **Goals:**
  * Build `backend/app/ml/train.py` to generate a synthetic 60-day hourly dataset calibrated to Odisha's power grid profile (high thermal coal baseline ~780 $gCO_2eq/kWh$ at night; dropping to ~310–380 $gCO_2eq/kWh$ during 10:00–15:30 solar peaks and monsoon hydro dispatch).
  * Train a `LightGBM` regressor (`LGBMRegressor`) on cyclical time features (`hour_sin`, `hour_cos`, `month`), `shortwave_radiation` ($W/m^2$), and `cloud_cover` (%), and serialize to `backend/app/ml/model.joblib`.
  * Build `backend/app/services/weather.py` using `httpx` to fetch 24-hour hourly forecasts from `https://api.open-meteo.com/v1/forecast` (with a local JSON fallback cache in case hackathon Wi-Fi drops).
* **Milestone Check:** Calling `predictor.forecast_24h()` returns 24 hourly $gCO_2eq/kWh$ predictions in under 50ms.

---

### Phase 3: Celery Carbon-Aware Orchestrator (Hours 5–10)
* **Goals:**
  * Configure `backend/app/worker/celery_app.py`:
    * Define queues `urgent_realtime` and `green_batch`.
    * Set `worker_prefetch_multiplier = 1` and `task_acks_late = True`.
  * Implement simulated data-center workloads in `backend/app/worker/tasks.py`:
    * `execute_compute_job(job_id, duration_sec)`: Simulates LLM fine-tuning / batch rendering (10–20s runtime), updates status in PostgreSQL, and calculates $CO_2$ saved relative to Odisha's peak coal baseline ($820\ gCO_2eq/kWh$).
  * Implement dynamic queue throttling in `backend/app/worker/controller.py`:
    * Evaluates `current_gco2_kwh` vs. `threshold_gco2_kwh` (default: `450`).
    * **If `current_gco2_kwh > threshold`:** Calls `celery_app.control.cancel_consumer("green_batch")` and marks queued deferrable jobs as `PAUSED_HIGH_CARBON`.
    * **If `current_gco2_kwh <= threshold`:** Calls `celery_app.control.add_consumer("green_batch")` and transitions paused jobs back to `QUEUED` for immediate worker pickup.
  * Register a **Celery Beat** periodic task (`evaluate_grid_and_dispatch`) running every 30 seconds.
* **Milestone Check:** Submitting 3 deferrable jobs while carbon is at `650 gCO2/kWh` holds them in `PAUSED_HIGH_CARBON`; lowering carbon to `340 gCO2/kWh` automatically triggers `add_consumer` and runs all 3 jobs sequentially.

---

### Phase 4: FastAPI REST & Telemetry Layer (Hours 10–13)
* **Goals:**
  * Build `backend/app/routes/jobs.py`:
    * `POST /api/jobs`: Accepts `{ name, job_type, priority, estimated_kwh }`, persists to PostgreSQL, and routes to `urgent_realtime` or `green_batch`.
    * `GET /api/jobs`: Returns ordered job list with live statuses and per-job carbon savings.
  * Build `backend/app/routes/telemetry.py`:
    * `GET /api/telemetry`: Returns current grid carbon intensity, green threshold, worker consumer state (`ACTIVE` vs `THROTTLED`), 24h forecast series, and aggregated KPI totals (total kWh shifted, total kg $CO_2$ avoided).
    * `POST /api/simulate`: Demo override endpoint accepting `{ scenario: "SOLAR_PEAK" | "COAL_SPIKE" | "LIVE_WEATHER" }` to immediately update grid carbon intensity and invoke `controller.sync_queue_state()`.
* **Milestone Check:** All endpoints verified via FastAPI's `/docs` Swagger UI.

---

### Phase 5: React Operator Dashboard (Hours 13–19)
* **Goals:**
  * Scaffold Vite + React + Tailwind CSS frontend with a 2-second polling hook (`useTelemetry`) for real-time responsiveness.
  * Build 4 focused UI modules:
    1. **`KpiHeader.jsx`:** Displays Current Odisha Grid Intensity ($gCO_2eq/kWh$), Grid Status Pill (`GREEN WINDOW` / `COAL PEAK`), Total Clean kWh Consumed, and Total $CO_2$ Offset (kg).
    2. **`CarbonForecastChart.jsx` (Recharts):** Area/Line chart plotting the 24-hour predicted carbon curve with a horizontal reference threshold line (`450 gCO2/kWh`) highlighting optimal scheduling windows.
    3. **`GridSimulatorPanel.jsx`:** Interactive control bar with preset buttons (**"Simulate Afternoon Solar (320 g)"**, **"Simulate Monsoon Cloud Cover (680 g)"**, **"Reset to Live Open-Meteo"**) plus a quick-submit form for Urgent vs. Deferrable AI jobs.
    4. **`WorkloadQueueTable.jsx`:** Live table displaying queued, paused, running, and completed jobs with color-coded status badges and carbon savings per job.
* **Milestone Check:** Flipping the simulator toggle updates the dashboard chart, worker badge, and job statuses within 2 seconds.

---

### Phase 6: Integration Testing & Fallback Hardening (Hours 19–22)
* **Goals:**
  * Run 5 full end-to-end rehearsals of the live demo flow.
  * Verify that `urgent_realtime` jobs bypass throttling and complete immediately even when `green_batch` is paused.
  * Seed initial sample jobs and 24-hour forecast records on startup (`lifespan` event in `main.py`) so the dashboard never opens to an empty screen.

---

### Phase 7: Pitch Deck & Demo Backup (Hours 22–24)
* **Goals:**
  * Record a 60-second 1080p screen capture of the working system as a fail-safe against venue Wi-Fi or projection issues.
  * Finalize a concise 4-slide pitch deck:
    1. **Problem:** Odisha's growing AI data center parks face high diurnal carbon volatility between thermal base load and solar/hydro peaks.
    2. **Solution & Green AI Design:** Lightweight LightGBM predictor + Celery dynamic queue throttling (`cancel_consumer` / `add_consumer`).
    3. **Live Product Demo:** Real-time workload deferral and ESG savings tracking.
    4. **Impact:** Quantified Scope 2 emissions reduction and alignment with Odisha's green energy incentives.

---

## 3. Critical Implementation Guardrails

* **Prevent Celery Task Prefetching:** Always start workers with `--prefetch-multiplier=1` (or set `worker_prefetch_multiplier = 1` in `celery_app.py`). Without this, Celery pre-loads up to 4 tasks per CPU core into memory before `cancel_consumer` can pause the queue.
* **Windows Compatibility (If Developing on Windows):** Run Celery with `--pool=solo` or `--pool=threads` (`celery -A app.worker.celery_app worker --pool=threads -Q urgent_realtime,green_batch`) to avoid `billiard` fork errors on Windows.
* **Offline Resilience:** Cache the latest Open-Meteo response to `backend/app/ml/cached_weather.json` so API timeouts never break the live forecast endpoint.