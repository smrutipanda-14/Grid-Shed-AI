import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { Sparkles } from 'lucide-react';

export function Header({ 
  currentTab, 
  gridMetrics, 
  onSimulateFluctuation, 
  isSimulating,
  lastReevaluationSeconds 
}) {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Grid Overview';
      case 'jobs':
        return 'Job Management';
      case 'reserve':
        return 'Reserve Queue';
      case 'savings':
        return 'Carbon Savings';
      default:
        return 'Overview';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-eco-surface/90 backdrop-blur-md border-b border-eco-border/60 px-8 py-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Minimal Breadcrumb & Title */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-500">grid-shed</span>
          <span className="text-slate-600">/</span>
          <span className="text-white font-medium">{getTabTitle()}</span>
          <span className="text-[10px] text-slate-500 hidden md:inline">· OPTCL Substation 400kV</span>
        </div>

        {/* Right: Live Telemetry & Actions */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <StatusBadge status={gridMetrics?.gridStatus || 'Optimal'} pulse size="sm" />

          <div className="text-slate-400 hidden sm:block">
            <span>Carbon: </span>
            <span className="text-eco-neon font-bold">{gridMetrics?.currentCarbonIntensity ?? 184} g/kWh</span>
          </div>

          <div className="text-slate-500 hidden md:block">
            <span>Audit: </span>
            <span className="text-slate-300 font-bold">{lastReevaluationSeconds}s</span>
          </div>

          {/* Simulation Button */}
          <button
            onClick={onSimulateFluctuation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-eco-border bg-eco-card text-eco-neon hover:border-eco-neon text-xs transition-colors disabled:opacity-50 shadow-neon-green-sm"
            title="Simulate cloud cover or green surge"
          >
            <Sparkles className="h-3 w-3 text-eco-neon" />
            <span>{isSimulating ? 'Updating...' : 'Simulate Grid'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
