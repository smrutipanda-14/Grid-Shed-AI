import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export function RenewableMixDonut({ 
  mix = [], 
  renewableTotal = 84, 
  totalLoadMW = 4280 
}) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-eco-surface border border-eco-border rounded-lg px-3 py-2 text-xs font-mono shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="text-white font-medium">{data.name}</span>
          </div>
          <div className="text-slate-400">
            Share: <span className="text-eco-neon font-medium">{data.value}%</span> ({data.mw} MW)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="eco-card-clean p-6 flex flex-col justify-between h-full">
      {/* Sleek Header */}
      <div className="flex items-center justify-between pb-3 border-b border-eco-border/40">
        <div>
          <h3 className="text-sm font-medium text-white tracking-tight">Renewable Energy Mix</h3>
          <p className="text-xs text-eco-muted mt-0.5 font-mono">Generation Breakdown by Resource</p>
        </div>
        <div className="text-right font-mono text-xs text-slate-400">
          <span>{totalLoadMW.toLocaleString()} MW Total</span>
        </div>
      </div>

      {/* Donut and Simple Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-4">
        {/* Donut */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mix}
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={74}
                paddingAngle={3}
                dataKey="value"
                stroke="#070b0e"
                strokeWidth={2}
              >
                {mix.map((entry, index) => (
                  <Cell key={`mix-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Minimal Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold font-mono text-eco-neon">
              {renewableTotal}%
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
              Renewable
            </span>
          </div>
        </div>

        {/* Simple Minimal Legend */}
        <div className="flex-1 w-full space-y-2.5">
          {mix.map((item) => (
            <div 
              key={item.name} 
              className="flex items-center justify-between text-xs font-mono hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-sans truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <span className="text-slate-500 text-[11px]">{item.mw} MW</span>
                <span className="font-medium w-8 text-right" style={{ color: item.color }}>{item.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle Footer */}
      <div className="pt-3 border-t border-eco-border/40 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="flex items-center gap-1.5 text-eco-neon">
          <span className="w-1.5 h-1.5 rounded-full bg-eco-neon animate-pulse" />
          Optimal Solar Generation Peak
        </span>
        <span>Hirakud + Balimela</span>
      </div>
    </div>
  );
}
