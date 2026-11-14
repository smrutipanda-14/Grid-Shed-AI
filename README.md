# Grid-Shed AI

Grid-Shed AI is a carbon-aware workload orchestrator with a React web interface and a FastAPI backend.

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
