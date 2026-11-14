# Grid-Shed AI

Grid-Shed AI is a carbon-aware workload orchestrator with a React web interface and a FastAPI backend.
## 🚀 Tech Stack

- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS with custom Dark Eco-Cybernetic Theme
- **Data Visualization:** Recharts
- **Icons:** Lucide React
- **Typography:** Inter & JetBrains Mono

---

## 🎨 Theme System (Strict Environmental Dark Mode)

The UI uses a strict dark mode palette designed specifically for energy grid and carbon monitoring:
- **Backgrounds:** Deep slate-blacks (`#070b0e`, `#0c1319`, `#111b23`) with subtle cyber-grid textures.
- **Positive Metrics (Solar, Clean Grid):** Glowing neon green (`#00ff87`, `rgba(0,255,135,0.35)`) and cyber cyan (`#00f0ff`).
- **Marginal / Warning States:** Glowing amber (`#f59e0b`).
- **Grid Constraints & Fossil Surge:** Neon red alert (`#ef4444`).

---

## 🖥️ Application Pages & Features

### 1. Dashboard (Grid Overview)
- **Live Carbon Intensity Gauge:** Semi-circular SVG gauge showing real-time `gCO2/kWh`, comparison against 24-hour baseline, and safety thresholds.
- **Renewable Energy Mix Donut:** Interactive Recharts donut chart detailing Solar PV, Hydroelectric (Hirakud/Balimela), Pumped Storage, and Thermal generation percentages and MW draw.
- **Grid Stability Status Badge:** Real-time synchronization indicator (Optimal / Moderate / Constrained) based on grid frequency (~50Hz) and marginal carbon levels.
- **24-Hour Carbon Intensity Forecast:** Area/line chart with explicit green shaded zone for **Green Windows (10:00 AM – 3:00 PM)** and a 250 gCO2/kWh emission cap reference line.
- **Weather & Solar Irradiance Correlator:** Micro-charts and sparklines tracking ambient temperature, cloud cover, direct solar irradiance (W/m²), and Hirakud hydro reservoir head levels.

### 2. Job Management
- **Workload Intake Form:** Submit AI Training or Data Processing workloads with energy requirements (kWh), scheduling priority, hard deadline picker, and flexibility (Urgent vs. Flexible).
- **AI Decision Preview:** Real-time recommendation preview indicating whether the job will execute immediately or be held in the reserve queue.
- **Grouped Workloads Table:** Filterable table displaying Running (with live progress bars), Pending (awaiting green windows), and Completed jobs with carbon savings logs.

### 3. Reserve Queue
- **Curtailed Workloads:** Jobs held back due to low renewable share or excessive thermal generation.
- **Columns:** Job Name, Priority, Reason for Reservation, Current Grid %, Required Grid %, Predicted Execution Window, and Deadline.
- **Celery Scheduler Loop Indicator:** Animated radar and countdown timer simulating autonomous 60-second grid audits.
- **Interactive Controls:** "Force Run / Override" to bypass curtailment, and "Trigger Green Surge" to simulate solar generation spikes.

### 4. Carbon Savings Analytics
- **Executive Metrics:** Total CO₂ avoided (Tonnes), energy shifted (MWh), rescheduled workloads count, and equivalent mature trees planted.
- **Before vs. After Comparison Bar Chart:** Direct comparison of immediate execution emissions (fossil peak) vs. shifted execution emissions.
- **7-Day Trajectory:** Historical cumulative carbon abatement trend.
- **ESG Audit Export:** One-click compliance report simulation.

---

## Requirements

Install these before starting:

- Python 3.10 or later
- Node.js 18 or later (includes npm)
- Git, if you are cloning the repository

The backend uses SQLite by default, so you do not need to install or configure a separate database. Redis is optional for local use.

## Setup

### 1. Get the project

If you have not already downloaded the project, clone it and move into its folder:

```bash
git clone https://github.com/smrutipanda-14/Grid-Shed-AI.git
cd Grid-Shed-AI
```

### 2. Install backend dependencies

Run these commands from the project root.

**Windows PowerShell:**

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
```

**macOS or Linux:**

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
```

Keep the virtual environment activated in the terminal where you run the backend.

### 3. Install frontend dependencies

Open another terminal at the project root and run:

```bash
npm install
```

## Run the project

You need two terminals open: one for the backend and one for the frontend.

### 1. Start the backend

In the first terminal, activate the virtual environment if it is not already active, then run this from the project root:

```bash
python -m uvicorn backend.app.main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive API documentation is at `http://localhost:8000/docs`.

On its first startup, the backend creates the local SQLite database (`grid_shed.db`) and sample data.

### 2. Start the frontend

In the second terminal, run this from the project root:

```bash
npm run dev
```

Open the URL printed in the terminal, usually `http://localhost:5173`.

## Optional: Redis and background jobs

Redis is not required to start the application. Without Redis, backend job tasks run synchronously in the API process. To use Celery's background job processing, install and start Redis locally, then start a Celery worker using the settings in `backend/app/core/celery_app.py`.

## Stop the project

Press `Ctrl+C` in each terminal running the backend and frontend. To leave the Python virtual environment, run `deactivate`.

## Common issues

- **`python` or `npm` is not recognized:** Install Python or Node.js, reopen the terminal, and check with `python --version` and `npm --version`.
- **PowerShell blocks virtual environment activation:** Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in that terminal, then activate the environment again.
- **The frontend cannot reach the API:** Make sure the backend is running at `http://localhost:8000` and the frontend is running at `http://localhost:5173`.
- **A port is already in use:** Stop the other process using port `8000` or `5173`, then restart the corresponding server.
