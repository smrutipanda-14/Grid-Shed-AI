import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Sun, Droplets, BatteryCharging, Flame, Layers } from 'lucide-react';

const ICONS = {
  Sun: Sun,
  Droplets: Droplets,
  BatteryCharging: BatteryCharging,
  Flame: Flame,
};

export function RenewableMixDonut({ 
  mix = [], 
  renewableTotal = 84, 
  totalLoadMW = 4280 
}) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-eco-card border border-eco-border rounded-lg p-3 shadow-card-dark font-mono text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <span className="font-semibold text-white">{data.name}</span>
          </div>
          <div className="text-slate-300">
            Share: <strong className="text-eco-neon">{data.value}%</strong>
          </div>
          <div className="text-slate-400">
            Generation: <strong className="text-white">{data.mw} MW</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="eco-glass-card rounded-2xl p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-eco-cyan/15 text-eco-cyan border border-eco-cyan/30">
              <Layers className="h-4 w-4" />
            </span>
            <h3 className="font-semibold text-white text-base tracking-wide">Renewable Energy Mix</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">GRIDCO Generation Dispatch Breakdown</p>
        </div>

        <div className="text-right font-mono">
          <span className="text-[11px] text-slate-500 uppercase block">Grid Generation</span>
          <span className="text-sm font-bold text-white">{totalLoadMW.toLocaleString()} MW</span>
        </div>
      </div>

      {/* Donut and Legend Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 my-2">
        {/* Donut Chart with Center Metric */}
        <div className="sm:col-span-6 relative h-48 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mix}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={78}
                paddingAngle={4}
                dataKey="value"
                stroke="#0c1319"
                strokeWidth={3}
              >
                {mix.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold font-mono text-eco-neon drop-shadow-sm">
              {renewableTotal}%
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Renewable
            </span>
          </div>
        </div>

        {/* Breakdown Legend Items */}
        <div className="sm:col-span-6 space-y-2">
          {mix.map((item) => {
            const Icon = ICONS[item.icon] || Sun;
            return (
              <div 
                key={item.name}
                className="flex items-center justify-between p-2 rounded-lg bg-eco-surface/70 border border-eco-border/60 hover:border-eco-border transition-colors text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="p-1 rounded-md"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-slate-200 font-sans font-medium text-xs block">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {item.mw} MW
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span 
                    className="font-bold text-sm"
                    style={{ color: item.color }}
                  >
                    {item.value}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-eco-border/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5 text-eco-neon">
          <span className="w-1.5 h-1.5 rounded-full bg-eco-neon animate-pulse" />
          Optimal Solar Dispatch (38%)
        </span>
        <span className="text-slate-500">Hirakud + Balimela Active</span>
      </div>
    </div>
  );
}
