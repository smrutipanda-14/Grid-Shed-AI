import React from 'react';
import { 
  Zap, 
  RefreshCw, 
  Calendar, 
  Radio, 
  Cpu, 
  Sparkles,
  AlertTriangle,
  SunMedium
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export function Header({ 
  currentTab, 
  gridMetrics, 
  onSimulateFluctuation, 
  isSimulating,
  lastReevaluationSeconds
}) {
  const getTabDetails = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Odisha Grid Telemetry & Forecast',
          subtitle: 'Real-time carbon intensity, renewable generation mix, and weather correlation',
        };
      case 'jobs':
        return {
          title: 'Workload Orchestration & Job Intake',
          subtitle: 'Dispatch AI training and batch processing against optimal green windows',
        };
      case 'reserve':
        return {
          title: 'Carbon-Curtailed Reserve Queue',
          subtitle: 'Workloads held back pending renewable surplus and carbon threshold clearance',
        };
      case 'savings':
        return {
          title: 'Carbon Abatement & Savings Analytics',
          subtitle: 'Audit trail of avoided CO₂ emissions, shifted MWh, and ESG compliance ROI',
        };
      default:
        return { title: 'Grid-Shed AI', subtitle: 'Workload Orchestrator' };
    }
  };

  const details = getTabDetails();

  return (
    <header className="sticky top-0 z-20 bg-eco-surface/90 backdrop-blur-md border-b border-eco-border px-8 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Page Title & Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <span>GRID-SHED</span>
            <span>/</span>
            <span className="text-eco-neon uppercase">{currentTab}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="text-slate-500">OPTCL 400kV Substation Feed</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {details.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{details.subtitle}</p>
        </div>

        {/* Right: Live Telemetry Tickers & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Stability Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-eco-card border border-eco-border">
            <Radio className="h-3.5 w-3.5 text-eco-neon animate-pulse" />
            <span className="text-xs text-slate-400 font-mono">Status:</span>
            <StatusBadge status={gridMetrics?.gridStatus || 'Optimal'} pulse />
          </div>

          {/* Grid Frequency */}
          <div className="px-3 py-1.5 rounded-lg bg-eco-card border border-eco-border flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Grid Freq:</span>
            <span className="text-xs font-mono font-bold text-eco-cyan">
              {gridMetrics?.gridFrequency?.toFixed(2) ?? '50.02'} Hz
            </span>
          </div>

          {/* Carbon Intensity */}
          <div className="px-3 py-1.5 rounded-lg bg-eco-card border border-eco-border flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Carbon:</span>
            <span className="text-xs font-mono font-bold text-eco-neon">
              {gridMetrics?.currentCarbonIntensity ?? 184}
              <span className="text-[10px] text-slate-400 font-normal ml-0.5">g/kWh</span>
            </span>
          </div>

          {/* Scheduler loop indicator */}
          <div className="px-3 py-1.5 rounded-lg bg-eco-card border border-eco-border flex items-center gap-2 text-xs font-mono text-slate-400">
            <RefreshCw className={`h-3 w-3 text-eco-neon ${isSimulating ? 'animate-spin' : ''}`} />
            <span>Audit: <strong className="text-white">{lastReevaluationSeconds}s</strong></span>
          </div>

          {/* Interactive Simulation Button */}
          <button
            onClick={onSimulateFluctuation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 bg-gradient-to-r from-eco-neon/20 via-eco-cyan/20 to-emerald-950 border border-eco-neon/50 text-eco-neon hover:border-eco-neon hover:shadow-neon-green-sm active:scale-95 disabled:opacity-50"
            title="Simulate sudden cloud cover or green window surge"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isSimulating ? 'Updating Grid...' : 'Simulate Grid Fluctuation'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
