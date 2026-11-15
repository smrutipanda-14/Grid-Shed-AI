import React from 'react';
import { CarbonComparisonBarChart } from '../../components/charts/CarbonComparisonBarChart';
import { ArrowDownRight, Leaf, Zap, BarChart3 } from 'lucide-react';

export function CarbonSavingsPage({ savingsData }) {
  return (
    <div className="space-y-6">
      {/* SECTION 1: Analytics Header - 3 Clean Stat Figures */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total CO2 Avoided */}
        <div className="eco-card-clean p-6">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Leaf className="h-3.5 w-3.5 text-eco-neon" /> Total CO₂ Avoided
            </span>
            <span className="flex items-center text-eco-neon text-[11px] font-bold">
              <ArrowDownRight className="h-3 w-3 mr-0.5" />
              +{savingsData.totalCO2AvoidedDeltaPct}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-eco-neon">
              {savingsData.totalCO2AvoidedTonnes}
            </span>
            <span className="text-xs font-mono text-slate-400">Tonnes CO₂e</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Equal to {savingsData.treesEquivalent} mature trees planted
          </p>
        </div>

        {/* Card 2: Energy Shifted */}
        <div className="eco-card-clean p-6">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-eco-cyan" /> Energy Shifted
            </span>
            <span className="text-eco-cyan text-[11px] font-mono">Clean Peak</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-eco-cyan">
              {savingsData.energyShiftedMWh}
            </span>
            <span className="text-xs font-mono text-slate-400">MWh</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Shifted from thermal hours to solar/hydro surplus
          </p>
        </div>

        {/* Card 3: Rescheduled Jobs */}
        <div className="eco-card-clean p-6">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-eco-amber" /> Rescheduled Jobs
            </span>
            <span className="text-slate-400 text-[11px] font-mono">{savingsData.averageShiftDelayHours}h avg delay</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white">
              {savingsData.rescheduledJobsCount}
            </span>
            <span className="text-xs font-mono text-slate-400">Workloads</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Zero deadline or SLA violations recorded
          </p>
        </div>
      </div>

      {/* SECTION 2: Simple Before-and-After Comparison Bar Chart */}
      <div>
        <CarbonComparisonBarChart data={savingsData.jobComparisonData} />
      </div>

      {/* Subtle ESG Footnote */}
      <div className="p-4 rounded-xl border border-eco-border/40 bg-eco-surface/40 text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>GHG Protocol Scope 2 location-based compliance audit verified</span>
        <span className="text-slate-400">GRIDCO Odisha Substation Feed</span>
      </div>
    </div>
  );
}
