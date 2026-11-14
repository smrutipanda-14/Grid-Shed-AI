# Project Requirement Document (PRD): Grid-Shed AI

## 1. Project Overview
**Grid-Shed AI** is a carbon-aware workload orchestrator designed for data centers in Odisha. It acts as a middleware dashboard that monitors real-time carbon intensity and renewable energy mix on the Odisha power grid (GRIDCO/OPTCL parameters). By dynamically shifting non-urgent AI model training and data processing jobs to peak renewable generation hours, it minimizes fossil-fuel reliance.

## 2. Tech Stack
*   **Frontend:** React, Tailwind CSS (Dark mode with an environmental theme: deep greens, neon accents, dark gray/black backgrounds), Recharts/Chart.js (for data visualization).
*   **Backend:** Python, FastAPI.
*   **Task Queue:** Celery with Redis broker.
*   **Machine Learning:** Scikit-learn/Statsmodels (predictive regression model for time-series carbon forecasting).
*   **Database:** PostgreSQL (with SQLAlchemy or SQLModel).

---

## 3. Database Schema

The database requires three primary entities to manage workloads, grid metrics, and analytics. 

```prisma
// Job Table
Table Job {
  id UUID [primary key]
  name VARCHAR
  type VARCHAR [note: 'AI Training' | 'Data Processing']
  energy_requirement FLOAT [note: 'Estimated kWh']
  priority VARCHAR [note: 'High' | 'Medium' | 'Low']
  deadline TIMESTAMP
  flexibility VARCHAR [note: 'Urgent' | 'Flexible']
  status VARCHAR [note: 'Executing' | 'Reserved' | 'Completed' | 'Failed']
  reserve_reason TEXT
  expected_execution_time TIMESTAMP
  created_at TIMESTAMP
  executed_at TIMESTAMP
  completed_at TIMESTAMP
}

// Grid Metrics Table (Time-Series Data)
Table GridMetric {
  id UUID [primary key]
  timestamp TIMESTAMP
  carbon_intensity FLOAT [note: 'gCO2/kWh']
  solar_pct FLOAT
  hydro_pct FLOAT
  pumped_storage_pct FLOAT
  thermal_pct FLOAT
  grid_frequency FLOAT [note: 'Standard 50Hz']
  grid_status VARCHAR [note: 'Optimal' | 'Moderate' | 'Constrained']
  weather_condition VARCHAR
  solar_irradiance FLOAT
  hydro_reservoir_head FLOAT
}

// Carbon Savings Analytics Table
Table CarbonSaving {
  id UUID [primary key]
  job_id UUID [ref: > Job.id]
  co2_immediate_exec FLOAT [note: 'Estimated CO2 if run at submission']
  co2_shifted_exec FLOAT [note: 'Actual/Estimated CO2 after shifting']
  co2_avoided FLOAT
  energy_shifted FLOAT [note: 'kWh']
  recorded_at TIMESTAMP
}
```

---

## 4. Frontend Folder Structure (React + Tailwind)

```text
frontend/
├── public/
├── src/
│   ├── assets/              # Images, icons, global styles
│   ├── components/
│   │   ├── charts/          # DonutChart, CarbonTimeline, GaugeChart
│   │   ├── common/          # Buttons, Modals, StatusBadges
│   │   └── layout/          # Sidebar, Navbar, PageWrapper
│   ├── pages/
│   │   ├── Dashboard/       # Live metrics, timeline, mix chart
│   │   ├── JobManagement/   # Job submission form, job lists
│   │   ├── ReserveQueue/    # Reserved jobs, countdowns, thresholds
│   │   └── CarbonSavings/   # Analytics, before/after comparisons
│   ├── services/            # API client (Axios/Fetch wrappers)
│   ├── store/               # State management (Zustand or Redux)
│   ├── theme/               # Tailwind config extensions (Dark eco-theme colors)
│   ├── utils/               # Formatting dates, calculating percentages
│   ├── App.jsx
│   └── main.jsx
├── tailwind.config.js       # Custom eco-dark themes configured here
└── package.json
```

---

## 5. Backend Folder Structure (FastAPI + Celery)

```text
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/       # /jobs, /grid, /analytics, /predictions
│   │   └── router.py        # API routing
│   ├── core/
│   │   ├── config.py        # Environment variables, DB URI
│   │   └── celery_app.py    # Celery & Redis configuration
│   ├── db/
│   │   ├── session.py       # Database connection
│   │   └── models.py        # SQLAlchemy models (Job, GridMetric, CarbonSaving)
│   ├── ml/
│   │   ├── predictor.py     # Grid carbon forecasting regression model
│   │   └── models/          # Saved model weights (.pkl or .onnx)
│   ├── schemas/             # Pydantic validation models (JobCreate, JobResponse, etc.)
│   ├── services/
│   │   ├── scheduler.py     # AI Decision Engine (Execute vs Reserve logic)
│   │   └── grid_monitor.py  # Mock/live integration with Odisha GRIDCO data
│   ├── worker/
│   │   └── tasks.py         # Celery background tasks (Queue evaluation, job execution)
│   └── main.py              # FastAPI application entry point
├── requirements.txt
└── Dockerfile
```

---

## 6. Antigravity Prompt (AI Code Generation Prompt)

Copy and paste the following comprehensive prompt into your AI coding agent (e.g., Antigravity, Cursor, Devin, or GitHub Copilot workspace) to scaffold the complete application:

```text
You are an expert full-stack developer. Your task is to build "Grid-Shed AI", a Carbon-Aware Workload Orchestrator for Odisha Data Centers. 

Tech Stack:
- Frontend: React, Tailwind CSS, Recharts, Lucide React (Icons).
- Backend: Python, FastAPI, Celery, Redis, SQLAlchemy.
- Design: Strict dark mode with an environmental theme (deep background greens/blacks, glowing neon green/cyan accents for positive metrics, amber/red for grid constraints).

Please build the application based on the following requirements:

1. FRONTEND PAGES & COMPONENTS:
Create a 4-page layout with a persistent sidebar navigation.

Page 1: Dashboard (Grid Condition Overview)
- Build a "Live Carbon Intensity Gauge" showing current gCO2/kWh.
- Build a "Renewable Energy Mix Donut Chart" displaying Solar, Hydro, Pumped Storage, and Thermal percentages.
- Build a "Grid Stability Status Badge" (Optimal/Moderate/Constrained) based on frequency (~50Hz) and carbon levels.
- Build a "24-Hour Carbon Intensity Timeline" (Line chart) forecasting hour-by-hour emissions, with "Green Windows" (10 AM - 3 PM) explicitly shaded green.
- Build a "Weather & Solar Irradiance Correlator" using micro-charts (sparklines) showing weather, irradiance, and hydro reservoir head levels.

Page 2: Job Management
- Build a Job Submission Form with fields: Job Name, Type (AI Training/Data Processing), Energy Requirement (kWh), Priority (High/Medium/Low), Deadline (Date/Time picker), and Flexibility (Urgent/Flexible).
- Display a data table of jobs grouped by status (Running, Pending, Completed) showing execution status.

Page 3: Reserve Queue
- Display a list/table of jobs currently held back due to low renewable energy.
- Columns must include: Job Name, Priority, Reason for Reservation, Current Grid %, Required Grid %, Predicted Execution Time, and Deadline.
- Add a visual indicator showing the AI scheduler's auto-reevaluation loop.

Page 4: Carbon Savings
- Build an analytics dashboard displaying: Total CO2 emissions avoided, Energy shifted to cleaner periods, Number of rescheduled jobs.
- Build a "Before and After" comparison chart showing immediate execution emissions vs. shifted execution emissions.

2. BACKEND API & LOGIC (FastAPI + Celery):
- Create REST endpoints for job submission, fetching grid data, queue status, and carbon analytics.
- Implement the 'AI Decision Engine' logic: When a job is submitted, analyze current renewable availability (%), predicted availability, carbon intensity, priority, and deadline. 
- The engine must output one of two decisions: 
  a) "EXECUTE NOW": If current renewable availability >= required threshold (e.g., 75%).
  b) "RESERVE JOB": If availability is low (e.g., < 50%). Move to Redis/Celery queue.
- Implement a Celery background task that runs every minute to re-evaluate the Reserve Queue. If the grid turns green OR a job's deadline is imminent, move it from Reserved to Executing.
- Create a mock data generator service to simulate GRIDCO/OPTCL Odisha power grid fluctuations (solar peaking mid-day, thermal peaking at night).

3. DATABASE (SQLAlchemy):
- Scaffold tables for `Job`, `GridMetric` (time-series), and `CarbonSaving`. 

Please generate the complete codebase, providing the FastAPI models, routes, and Celery tasks first, followed by the React components and Tailwind configuration to achieve the dark environmental theme. Ensure all charts have mock data wired up for immediate visualization.
```