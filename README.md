# Grid-Shed AI — Carbon-Aware Workload Orchestrator

Grid-Shed AI is a carbon-aware workload orchestrator tailored for high-compute data centers operating on the Odisha power grid (GRIDCO / OPTCL parameters). It acts as intelligent middleware that continuously monitors marginal carbon intensity, renewable generation mix, and grid frequency (~50Hz). By dynamically shifting non-urgent AI model training and batch data processing jobs into forecasted "Green Windows", it significantly curtails fossil fuel dependence without compromising critical deadlines.

---

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

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install --prefix frontend
```

### 2. Run Development Server
```bash
# From repository root
npm run dev

# Or directly in frontend folder
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 3. Production Build
```bash
npm run build
```
