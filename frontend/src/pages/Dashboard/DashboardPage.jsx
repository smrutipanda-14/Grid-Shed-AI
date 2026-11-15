import React from 'react';
import { CarbonGauge } from '../../components/charts/CarbonGauge';
import { CarbonTimelineChart } from '../../components/charts/CarbonTimelineChart';
import { WeatherCorrelator } from '../../components/charts/WeatherCorrelator';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ArrowDownRight, ArrowRight, Clock, ShieldCheck, Sun } from 'lucide-react';

export function DashboardPage({ 
  gridMetrics, 
  timelineData, 
  onNavigate 
}) {
  return (
    <div className="space-y-6">
      {/* Top Focused Stat Row - Clean, minimal, ample negative space */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat 1: Live Carbon Intensity */}
        <div className="eco-card-clean p-5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Carbon Intensity</span>
            <span className="flex items-center text-eco-neon text-[11px] font-medium">
              <ArrowDownRight className="h-3 w-3 mr-0.5" />
              18.4% vs 24h avg
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">
              {gridMetrics?.currentCarbonIntensity ?? 184}
            </span>
            <span className="text-xs font-mono text-slate-400">gCO₂/kWh</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            GRIDCO Odisha marginal telemetry
          </p>
        </div>

        {/* Stat 2: Grid Stability Badge & Frequency */}
        <div className="eco-card-clean p-5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Grid Stability</span>
            <StatusBadge status={gridMetrics?.gridStatus || 'Optimal'} pulse size="sm" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-eco-cyan">
              {gridMetrics?.gridFrequency?.toFixed(2) ?? '50.02'}
            </span>
            <span className="text-xs font-mono text-slate-400">Hz</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Nominal frequency (~50Hz sync)
          </p>
        </div>

        {/* Stat 3: Green Window Horizon */}
        <div className="eco-card-clean p-5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Dispatch Window</span>
            <span className="text-eco-neon text-[11px] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-eco-neon animate-pulse" />
              Active
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">
              10 AM – 3 PM
            </span>
            <span className="text-xs font-mono text-eco-neon font-medium">Green Window</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Lowest carbon intensity generation hours
          </p>
        </div>
      </div>

      {/* Row 1: Sleek Live Carbon Intensity Gauge & Weather/Solar Correlator Sparklines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <CarbonGauge 
            currentCarbon={gridMetrics.currentCarbonIntensity}
            threshold={gridMetrics.carbonThreshold}
            gridFrequency={gridMetrics.gridFrequency}
            gridStatus={gridMetrics.gridStatus}
            delta={gridMetrics.carbonIntensityDelta}
          />
        </div>

        <div className="lg:col-span-7">
          <WeatherCorrelator weather={gridMetrics.weather} />
        </div>
      </div>

      {/* Row 2: 24-Hour Carbon Timeline (Line Chart with Green Window Shading) */}
      <div>
        <CarbonTimelineChart data={timelineData} />
      </div>

      {/* Minimal Bottom Action Ribbon */}
      <div className="p-4 rounded-xl border border-eco-border/60 bg-eco-surface/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-eco-neon shrink-0 animate-pulse" />
          <p className="text-xs text-slate-300 font-mono">
            Grid condition is <strong className="text-eco-neon">Optimal</strong>. Solar and hydro surplus currently active for scheduled compute.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('jobs')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-eco-neon text-eco-darkest text-xs font-mono font-bold hover:bg-eco-neon/90 transition-all shadow-neon-green-sm"
          >
            <span>Submit Workload</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onNavigate('reserve')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-eco-border bg-eco-surface text-slate-300 hover:text-white hover:border-slate-500 text-xs font-mono transition-colors"
          >
            Reserve Queue
          </button>
        </div>
      </div>
    </div>
  );
}
