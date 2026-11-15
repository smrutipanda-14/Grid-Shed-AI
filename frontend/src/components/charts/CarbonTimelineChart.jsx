import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';

export function CarbonTimelineChart({ data = [] }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const isGreen = item.isGreenWindow;

      return (
        <div className="bg-eco-surface border border-eco-border rounded-lg p-3 text-xs font-mono shadow-md min-w-[180px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-eco-border/40 mb-1.5">
            <span className="text-white font-medium">{label} hrs</span>
            {isGreen && (
              <span className="text-[10px] text-eco-neon font-semibold uppercase tracking-wider">
                Green Window
              </span>
            )}
          </div>

          <div className="space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>Carbon:</span>
              <span className={`font-medium ${isGreen ? 'text-eco-neon' : 'text-slate-200'}`}>
                {item.carbon} gCO₂/kWh
              </span>
            </div>
            <div className="flex justify-between">
              <span>Renewable:</span>
              <span className="text-eco-cyan font-medium">{item.renewablePct}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="eco-card-clean p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-eco-border/40">
        <div>
          <h3 className="text-sm font-medium text-white tracking-tight">24-Hour Carbon Timeline</h3>
          <p className="text-xs text-eco-muted mt-0.5 font-mono">Predicted marginal emissions (gCO₂/kWh) with optimal green window</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-0.5 bg-eco-neon inline-block shadow-neon-green-sm" />
            <span>Emission Forecast</span>
          </span>
          <span className="flex items-center gap-1.5 text-eco-neon">
            <span className="w-2.5 h-2 bg-eco-neon/15 border border-eco-neon/40 inline-block rounded-xs" />
            <span>Green Window (10 AM – 3 PM)</span>
          </span>
        </div>
      </div>

      {/* Clean Line Chart - Stripped unnecessary gridlines */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="ecoCarbonGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff87" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#00ff87" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Subtle Reference Line for 250g cap */}
            <ReferenceLine
              y={250}
              stroke="#1a2733"
              strokeDasharray="3 3"
            />

            {/* Green Window Shaded Area (10:00 to 15:00) */}
            <ReferenceArea
              x1="10:00"
              x2="15:00"
              y1={100}
              y2={550}
              fill="rgba(0, 255, 135, 0.08)"
              stroke="rgba(0, 255, 135, 0.35)"
              strokeDasharray="3 3"
              label={{
                value: 'Green Window (Peak Solar)',
                position: 'insideTop',
                fill: '#00ff87',
                fontSize: 10,
                fontFamily: 'monospace',
                opacity: 0.85,
              }}
            />

            <XAxis 
              dataKey="hour" 
              stroke="#243545" 
              tick={{ fill: '#7e92a2', fontSize: 10, fontFamily: 'monospace' }} 
              axisLine={{ stroke: '#1a2733' }}
              tickLine={false}
              interval={2}
            />
            <YAxis 
              stroke="#243545" 
              tick={{ fill: '#7e92a2', fontSize: 10, fontFamily: 'monospace' }} 
              domain={[100, 550]}
              axisLine={false}
              tickLine={false}
              unit="g"
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="carbon"
              stroke="#00ff87"
              strokeWidth={2}
              fill="url(#ecoCarbonGrad)"
              activeDot={{ r: 4, fill: '#00ff87', stroke: '#070b0e', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Subtle Footer */}
      <div className="pt-3 mt-2 border-t border-eco-border/40 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span>Cap: &lt; 250 gCO₂/kWh recommended for batch workloads</span>
        <span>Low: <strong className="text-eco-neon font-medium">140 g</strong> at 12:00</span>
      </div>
    </div>
  );
}
