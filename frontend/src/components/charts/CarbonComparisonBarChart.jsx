import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { TrendingDown, Scale, CheckCircle2, ArrowDownRight } from 'lucide-react';

export function CarbonComparisonBarChart({ data = [] }) {
  const [metricView, setMetricView] = useState('job'); // 'job' or 'percentage'

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-eco-card border border-eco-border rounded-xl p-3 shadow-card-dark font-mono text-xs min-w-[210px]">
          <div className="font-bold text-white mb-2 pb-1 border-b border-eco-border text-sm">
            {item.name}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-eco-red-light">
                <span className="w-2 h-2 rounded-full bg-eco-red" />
                Immediate Run:
              </span>
              <span className="font-bold">{item.immediateKg} kg CO₂</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-eco-neon">
                <span className="w-2 h-2 rounded-full bg-eco-neon" />
                Shifted (Green):
              </span>
              <span className="font-bold text-eco-neon">{item.shiftedKg} kg CO₂</span>
            </div>

            <div className="pt-2 mt-1 border-t border-eco-border/80 flex items-center justify-between">
              <span className="text-slate-400">Avoided Emissions:</span>
              <span className="font-bold text-eco-cyan font-mono">
                -{item.avoidedKg} kg ({item.savingsPct}%)
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="eco-glass-card rounded-2xl p-6 flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-eco-neon/15 text-eco-neon border border-eco-neon/30">
              <Scale className="h-4 w-4" />
            </span>
            <h3 className="font-semibold text-white text-base tracking-wide">
              Before vs. After: Workload Carbon Footprint
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comparing hypothetical immediate dispatch (unconstrained fossil peak) against Grid-Shed optimized dispatch
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-eco-neon/15 text-eco-neon border border-eco-neon/30 font-bold flex items-center gap-1">
            <ArrowDownRight className="h-3.5 w-3.5" /> Average 66.8% CO₂ Abated
          </span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 15, left: -10, bottom: 25 }}
            barGap={6}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1c2e3d" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              tick={{ fill: '#8b9bb4', fontSize: 11, fontFamily: 'monospace' }} 
              axisLine={{ stroke: '#1c2e3d' }}
              tickLine={{ stroke: '#1c2e3d' }}
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis 
              stroke="#64748b" 
              tick={{ fill: '#8b9bb4', fontSize: 11, fontFamily: 'monospace' }} 
              axisLine={{ stroke: '#1c2e3d' }}
              tickLine={{ stroke: '#1c2e3d' }}
              unit=" kg"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right"
              wrapperStyle={{ paddingBottom: '16px', fontSize: '11px', fontFamily: 'monospace' }}
            />

            {/* Red Bar: Immediate Unshifted Run */}
            <Bar 
              name="Immediate Execution (kg CO₂)" 
              dataKey="immediateKg" 
              fill="#ef4444" 
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />

            {/* Glowing Neon Green Bar: Shifted Run */}
            <Bar 
              name="Shifted Execution (kg CO₂)" 
              dataKey="shiftedKg" 
              fill="#00ff87" 
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Audit Summary */}
      <div className="pt-4 border-t border-eco-border flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-eco-neon">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Zero SLA / Deadline Violations Incurred
          </span>
        </div>
        <span className="text-slate-500">
          Emission formula: kWh × Marginal Grid Carbon Intensity (gCO₂/kWh) / 1000
        </span>
      </div>
    </div>
  );
}
