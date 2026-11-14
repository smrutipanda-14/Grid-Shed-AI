import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { TrendingDown, Calendar, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

export function CarbonTimelineChart({ data = [] }) {
  const [showThreshold, setShowThreshold] = useState(true);
  const [highlightGreenWindow, setHighlightGreenWindow] = useState(true);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const isGreen = item.isGreenWindow;

      return (
        <div className="bg-eco-card border border-eco-border rounded-xl p-3 shadow-card-dark font-mono text-xs min-w-[200px]">
          <div className="flex items-center justify-between pb-2 border-b border-eco-border/80 mb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-eco-cyan" />
              {label} hrs
            </span>
            {isGreen ? (
              <span className="px-1.5 py-0.5 text-[10px] bg-eco-neon/20 text-eco-neon border border-eco-neon/40 rounded uppercase font-semibold">
                Green Window
              </span>
            ) : (
              <span className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded uppercase">
                Standard Grid
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Carbon Intensity:</span>
              <span className={`font-bold ${item.carbon < 200 ? 'text-eco-neon' : item.carbon < 350 ? 'text-eco-amber-light' : 'text-eco-red-light'}`}>
                {item.carbon} gCO₂/kWh
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Renewable Share:</span>
              <span className="font-bold text-eco-cyan">{item.renewablePct}%</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-eco-border/60">
              <span>Solar: {item.solar}%</span>
              <span>Hydro: {item.hydro}%</span>
              <span>Thermal: {item.thermal}%</span>
            </div>

            <div className="mt-2 pt-1 text-[11px] font-sans">
              {isGreen ? (
                <span className="text-eco-neon flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Heavy AI training authorized
                </span>
              ) : (
                <span className="text-slate-400">
                  Delay flexible jobs to 10:00 AM window
                </span>
              )}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-eco-neon/15 text-eco-neon border border-eco-neon/30">
              <TrendingDown className="h-4 w-4" />
            </span>
            <h3 className="font-semibold text-white text-base tracking-wide">
              24-Hour Carbon Intensity Forecast
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Predicted gCO₂/kWh emissions across Odisha grid nodes with highlighted peak green window
          </p>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setHighlightGreenWindow(!highlightGreenWindow)}
            className={`px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1.5 ${
              highlightGreenWindow
                ? 'bg-eco-neon/15 text-eco-neon border-eco-neon/40 shadow-neon-green-sm'
                : 'bg-eco-surface text-slate-400 border-eco-border'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-eco-neon" />
            Green Windows (10 AM - 3 PM)
          </button>

          <button
            onClick={() => setShowThreshold(!showThreshold)}
            className={`px-2.5 py-1 rounded-md border transition-colors ${
              showThreshold
                ? 'bg-eco-cyan/15 text-eco-cyan border-eco-cyan/40'
                : 'bg-eco-surface text-slate-400 border-eco-border'
            }`}
          >
            Threshold (250g)
          </button>
        </div>
      </div>

      {/* Main Timeline Line Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="carbonAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff87" stopOpacity={0.35} />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>

              <pattern id="greenWindowStripe" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#00ff87" strokeWidth="2" strokeOpacity="0.1" />
              </pattern>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1c2e3d" vertical={false} />

            <XAxis 
              dataKey="hour" 
              stroke="#64748b" 
              tick={{ fill: '#8b9bb4', fontSize: 11, fontFamily: 'monospace' }} 
              axisLine={{ stroke: '#1c2e3d' }}
              tickLine={{ stroke: '#1c2e3d' }}
            />
            <YAxis 
              stroke="#64748b" 
              tick={{ fill: '#8b9bb4', fontSize: 11, fontFamily: 'monospace' }} 
              domain={[100, 550]}
              axisLine={{ stroke: '#1c2e3d' }}
              tickLine={{ stroke: '#1c2e3d' }}
              unit="g"
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Green Window Shaded Zone (10:00 to 15:00) */}
            {highlightGreenWindow && (
              <ReferenceArea
                x1="10:00"
                x2="15:00"
                y1={100}
                y2={550}
                fill="rgba(0, 255, 135, 0.12)"
                stroke="#00ff87"
                strokeWidth={1}
                strokeDasharray="4 4"
                label={{
                  value: '⚡ OPTIMAL GREEN WINDOW (Solar + Hydro Peak)',
                  position: 'insideTop',
                  fill: '#00ff87',
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                }}
              />
            )}

            {/* Threshold Line */}
            {showThreshold && (
              <ReferenceLine
                y={250}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: 'Orchestrator Emission Cap: 250 gCO₂/kWh',
                  position: 'insideBottomRight',
                  fill: '#f59e0b',
                  fontSize: 10,
                  fontFamily: 'monospace',
                }}
              />
            )}

            {/* Emission Area under curve */}
            <Area
              type="monotone"
              dataKey="carbon"
              stroke="#00ff87"
              strokeWidth={2.5}
              fill="url(#carbonAreaGradient)"
              activeDot={{ r: 6, fill: '#00ff87', stroke: '#070b0e', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Insight banner */}
      <div className="pt-3 border-t border-eco-border/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-eco-neon inline-block" />
            <span className="text-slate-300">Predicted Carbon Intensity</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-eco-neon/20 border border-eco-neon inline-block rounded-xs" />
            <span className="text-eco-neon">Green Window (10:00 - 15:00)</span>
          </span>
        </div>

        <div className="text-slate-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-eco-cyan" />
          <span>Next scheduled dispatch surge: <strong>12:00 PM (140 gCO₂/kWh)</strong></span>
        </div>
      </div>
    </div>
  );
}
