import React, { useState } from 'react';
import { 
  TrendingDown, 
  Zap, 
  Leaf, 
  Calendar, 
  Download, 
  TreePine, 
  Car, 
  DollarSign, 
  CheckCircle, 
  BarChart3,
  Sparkles,
  ArrowDownRight
} from 'lucide-react';
import { CarbonComparisonBarChart } from '../../components/charts/CarbonComparisonBarChart';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function CarbonSavingsPage({ savingsData }) {
  const [downloadNotice, setDownloadNotice] = useState(false);

  const handleExportAudit = () => {
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3000);
  };

  const trendData = savingsData.dailySavingsTrend;

  return (
    <div className="space-y-8">
      {/* SECTION 1: Analytics Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total CO2 Avoided */}
        <div className="eco-glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-eco-neon/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">Total CO₂ Avoided</span>
            <div className="p-2 rounded-lg bg-eco-neon/15 text-eco-neon border border-eco-neon/30">
              <Leaf className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-eco-neon">
              {savingsData.totalCO2AvoidedTonnes}
            </span>
            <span className="text-sm font-mono text-slate-400">Tonnes</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-mono text-eco-neon">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span>+{savingsData.totalCO2AvoidedDeltaPct}% vs previous cycle</span>
          </div>
        </div>

        {/* Metric 2: Energy Shifted to Cleaner Periods */}
        <div className="eco-glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-eco-cyan/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">Energy Shifted</span>
            <div className="p-2 rounded-lg bg-eco-cyan/15 text-eco-cyan border border-eco-cyan/30">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-eco-cyan">
              {savingsData.energyShiftedMWh}
            </span>
            <span className="text-sm font-mono text-slate-400">MWh</span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-2">
            Shifted from coal peak to solar & hydro
          </p>
        </div>

        {/* Metric 3: Number of Rescheduled Jobs */}
        <div className="eco-glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-eco-amber/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">Rescheduled Jobs</span>
            <div className="p-2 rounded-lg bg-eco-amber/15 text-eco-amber border border-eco-amber/30">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {savingsData.rescheduledJobsCount}
            </span>
            <span className="text-sm font-mono text-slate-400">Workloads</span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-2">
            Avg dispatch delay: <strong className="text-eco-neon">{savingsData.averageShiftDelayHours} hrs</strong>
          </p>
        </div>

        {/* Metric 4: Environmental Equivalence */}
        <div className="eco-glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">Ecological Equivalent</span>
            <div className="p-2 rounded-lg bg-emerald-500/15 text-eco-neon border border-emerald-500/30">
              <TreePine className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {savingsData.treesEquivalent}
            </span>
            <span className="text-sm font-mono text-slate-400">Trees</span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-2">
            Equal to {(savingsData.electricCarKmAvoided / 1000).toFixed(0)}k km vehicle emissions
          </p>
        </div>
      </div>

      {/* Export / Audit Report bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-eco-surface border border-eco-border gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-eco-neon/15 text-eco-neon">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="text-xs font-mono">
            <span className="text-white font-semibold">ESG Greenhouse Gas (GHG) Protocol Scope 2 Audit</span>
            <p className="text-slate-400 text-[11px]">Location-based and market-based accounting compliant (Odisha SLDC verified)</p>
          </div>
        </div>

        <button
          onClick={handleExportAudit}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-eco-card border border-eco-border text-eco-neon hover:border-eco-neon text-xs font-mono font-medium transition-all"
        >
          <Download className="h-3.5 w-3.5" />
          <span>{downloadNotice ? 'Exporting ESG CSV...' : 'Export Audit Certificate'}</span>
        </button>
      </div>

      {/* SECTION 2: Before & After Bar Chart */}
      <div>
        <CarbonComparisonBarChart data={savingsData.jobComparisonData} />
      </div>

      {/* SECTION 3: 7-Day Cumulative Savings Trend */}
      <div className="eco-glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h4 className="font-semibold text-white text-base">7-Day Avoided Emissions Trajectory</h4>
            <p className="text-xs text-slate-400">Daily breakdown of kilograms CO₂ abated by dynamic grid shifting</p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-eco-neon">
              <span className="w-2.5 h-2.5 rounded-full bg-eco-neon" />
              Avoided CO₂
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              Immediate Baseline
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="avoidedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff87" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00ff87" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2e3d" vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="#64748b" 
                tick={{ fill: '#8b9bb4', fontSize: 11, fontFamily: 'monospace' }} 
                axisLine={{ stroke: '#1c2e3d' }}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fill: '#8b9bb4', fontSize: 11, fontFamily: 'monospace' }} 
                axisLine={{ stroke: '#1c2e3d' }}
                unit=" kg"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#111b23', 
                  borderColor: '#1c2e3d',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="avoidedKg" 
                name="CO₂ Avoided" 
                stroke="#00ff87" 
                strokeWidth={2.5} 
                fill="url(#avoidedGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
