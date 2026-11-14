import React from 'react';
import { CarbonGauge } from '../../components/charts/CarbonGauge';
import { RenewableMixDonut } from '../../components/charts/RenewableMixDonut';
import { CarbonTimelineChart } from '../../components/charts/CarbonTimelineChart';
import { WeatherCorrelator } from '../../components/charts/WeatherCorrelator';
import { 
  Zap, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  Leaf, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export function DashboardPage({ 
  gridMetrics, 
  timelineData, 
  jobs = [], 
  reserveQueue = [],
  onNavigate 
}) {
  const runningJobsCount = jobs.filter(j => j.status === 'Running' || j.status === 'Executing').length;
  const reservedJobsCount = reserveQueue.length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Grid Status & Executive Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="eco-glass-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400">Data Center Power Draw</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {gridMetrics?.dataCenterDrawMW ?? 142.5} <span className="text-sm font-normal text-slate-400">MW</span>
            </div>
            <span className="text-[11px] font-mono text-eco-neon mt-0.5 block">
              98.2% Green Power Match
            </span>
          </div>
          <div className="p-3 rounded-lg bg-eco-neon/10 border border-eco-neon/30 text-eco-neon">
            <Zap className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="eco-glass-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400">Active Workloads</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {runningJobsCount} <span className="text-sm font-normal text-slate-400">Executing</span>
            </div>
            <span className="text-[11px] font-mono text-eco-cyan mt-0.5 block">
              88 Compute Nodes Busy
            </span>
          </div>
          <div className="p-3 rounded-lg bg-eco-cyan/10 border border-eco-cyan/30 text-eco-cyan">
            <Cpu className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="eco-glass-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400">Reserve Queue (Curtailed)</span>
            <div className="text-2xl font-bold font-mono text-eco-amber-light mt-1">
              {reservedJobsCount} <span className="text-sm font-normal text-slate-400">Delayed</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
              Saving peak thermal draw
            </span>
          </div>
          <div className="p-3 rounded-lg bg-eco-amber/10 border border-eco-amber/30 text-eco-amber">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="eco-glass-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400">Odisha Grid Stability</span>
            <div className="text-2xl font-bold font-mono text-eco-neon mt-1">
              {gridMetrics?.gridFrequency?.toFixed(2) ?? 50.02} <span className="text-sm font-normal text-slate-400">Hz</span>
            </div>
            <span className="text-[11px] font-mono text-eco-neon mt-0.5 block">
              Phase Angle Synchronized
            </span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-eco-neon">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Row 1: Live Carbon Gauge & Renewable Mix Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <CarbonGauge 
            currentCarbon={gridMetrics.currentCarbonIntensity}
            threshold={gridMetrics.carbonThreshold}
            gridFrequency={gridMetrics.gridFrequency}
            gridStatus={gridMetrics.gridStatus}
            delta={gridMetrics.carbonIntensityDelta}
          />
        </div>

        <div className="lg:col-span-6">
          <RenewableMixDonut 
            mix={gridMetrics.mix}
            renewableTotal={gridMetrics.renewablePctTotal}
            totalLoadMW={gridMetrics.totalGridLoadMW}
          />
        </div>
      </div>

      {/* Row 2: 24-Hour Carbon Timeline Forecasting & Green Windows */}
      <div>
        <CarbonTimelineChart data={timelineData} />
      </div>

      {/* Row 3: Weather & Solar Irradiance Correlator with Sparklines */}
      <div>
        <WeatherCorrelator weather={gridMetrics.weather} />
      </div>

      {/* Bottom Action Ribbon */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-eco-surface via-eco-card to-eco-surface border border-eco-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-eco-neon/15 text-eco-neon">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              Green Window Active: 10:00 AM – 3:00 PM Peak Generation Window
            </p>
            <p className="text-xs text-slate-400">
              Hirakud Hydro and Sambalpur Solar PV are dispatching maximum zero-carbon energy.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('jobs')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-eco-neon text-eco-darkest text-xs font-mono font-bold hover:bg-eco-neon/90 transition-all shadow-neon-green-sm"
          >
            Submit Workload <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onNavigate('reserve')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-eco-surface border border-eco-border text-slate-300 text-xs font-mono hover:text-white hover:border-slate-500 transition-colors"
          >
            View Reserved Jobs ({reservedJobsCount})
          </button>
        </div>
      </div>
    </div>
  );
}
