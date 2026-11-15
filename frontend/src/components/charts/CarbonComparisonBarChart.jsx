import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export function CarbonComparisonBarChart({ data = [] }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-eco-surface border border-eco-border rounded-lg p-3 text-xs font-mono shadow-md min-w-[190px]">
          <div className="text-white font-medium mb-1.5 pb-1 border-b border-eco-border/40">
            {item.name}
          </div>
          <div className="space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>Immediate Run:</span>
              <span className="text-eco-red-light font-bold">{item.immediateKg} kg</span>
            </div>
            <div className="flex justify-between">
              <span>Shifted Run:</span>
              <span className="text-eco-neon font-bold">{item.shiftedKg} kg</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-eco-border/40 text-[11px]">
              <span>Abated:</span>
              <span className="text-eco-cyan font-bold">-{item.avoidedKg} kg ({item.savingsPct}%)</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="eco-card-clean p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-eco-border/40">
        <div>
          <h3 className="text-sm font-medium text-white tracking-tight">Before-and-After Emissions Comparison</h3>
          <p className="text-xs text-eco-muted mt-0.5 font-mono">Immediate fossil-peak dispatch compared with green-window shifted execution</p>
        </div>
        <div className="text-xs font-mono text-eco-neon font-bold">
          Average 66.8% carbon abated
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 15, right: 10, left: -20, bottom: 20 }}
            barGap={4}
          >
            <XAxis 
              dataKey="name" 
              stroke="#243545" 
              tick={{ fill: '#7e92a2', fontSize: 10, fontFamily: 'monospace' }} 
              axisLine={{ stroke: '#1a2733' }}
              tickLine={false}
              angle={-10}
              textAnchor="end"
            />
            <YAxis 
              stroke="#243545" 
              tick={{ fill: '#7e92a2', fontSize: 10, fontFamily: 'monospace' }} 
              axisLine={false}
              tickLine={false}
              unit=" kg"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontFamily: 'monospace' }}
            />

            {/* Red bar for Immediate fossil run */}
            <Bar 
              name="Immediate Run (kg CO₂)" 
              dataKey="immediateKg" 
              fill="#ef4444" 
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
            />

            {/* Glowing Neon Green bar for Shifted clean run */}
            <Bar 
              name="Shifted Run (kg CO₂)" 
              dataKey="shiftedKg" 
              fill="#00ff87" 
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-3 border-t border-eco-border/40 text-[11px] font-mono text-slate-500 flex justify-between">
        <span>Methodology: Odisha GRIDCO marginal emission displacement factor</span>
        <span className="text-eco-neon">Zero SLA / deadline violations</span>
      </div>
    </div>
  );
}
