import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Sun, Droplets, CloudSun } from 'lucide-react';

export function WeatherCorrelator({ weather }) {
  if (!weather) return null;

  const irradianceData = weather.irradianceSparkline.map((val, idx) => ({ idx, val }));
  const hydroData = weather.hydroHeadSparkline.map((val, idx) => ({ idx, val }));

  return (
    <div className="eco-card-clean p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-eco-border/40">
        <div>
          <h3 className="text-sm font-medium text-white tracking-tight">Weather & Grid Correlator</h3>
          <p className="text-xs text-eco-muted mt-0.5 font-mono">Irradiance and reservoir head telemetry</p>
        </div>
        <span className="text-[11px] font-mono text-eco-neon">
          Correlation: 0.94 (Optimal)
        </span>
      </div>

      {/* 3 Simple Clean Sparkline Micro-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Solar Irradiance */}
        <div className="p-4 rounded-xl bg-eco-surface/70 border border-eco-border/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sun className="h-3.5 w-3.5 text-eco-neon" /> Irradiance
            </span>
            <span className="text-eco-neon text-[11px] font-medium">Peak Solar</span>
          </div>

          <div className="flex items-baseline justify-between my-1 font-mono">
            <div>
              <span className="text-xl font-bold text-white">{weather.irradianceWM2}</span>
              <span className="text-xs text-slate-400 ml-1">W/m²</span>
            </div>
            <span className="text-[10px] text-eco-neon">+14% vs avg</span>
          </div>

          {/* Sparkline */}
          <div className="h-10 w-full my-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={irradianceData}>
                <defs>
                  <linearGradient id="ecoSolarSparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ff87" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00ff87" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="val" 
                  stroke="#00ff87" 
                  strokeWidth={1.75} 
                  fill="url(#ecoSolarSparkGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] font-mono text-slate-500 flex justify-between mt-1">
            <span>06:00 (120)</span>
            <span>12:00 (850)</span>
            <span>18:00 (90)</span>
          </div>
        </div>

        {/* Card 2: Hydro Reservoir Level */}
        <div className="p-4 rounded-xl bg-eco-surface/70 border border-eco-border/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Droplets className="h-3.5 w-3.5 text-eco-cyan" /> Hirakud Hydro Head
            </span>
            <span className="text-eco-cyan text-[11px] font-medium">{weather.hydroCapacityPct}% Cap</span>
          </div>

          <div className="flex items-baseline justify-between my-1 font-mono">
            <div>
              <span className="text-xl font-bold text-white">{weather.hydroHeadMeters}</span>
              <span className="text-xs text-slate-400 ml-1">m</span>
            </div>
            <span className="text-[10px] text-slate-400">Inflow: {weather.hydroInflowRate}</span>
          </div>

          {/* Sparkline */}
          <div className="h-10 w-full my-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hydroData}>
                <defs>
                  <linearGradient id="ecoHydroSparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00f0ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="val" 
                  stroke="#00f0ff" 
                  strokeWidth={1.75} 
                  fill="url(#ecoHydroSparkGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] font-mono text-slate-500 flex justify-between mt-1">
            <span>Stable Head Level</span>
            <span className="text-eco-cyan">1,370 MW Ready</span>
          </div>
        </div>

        {/* Card 3: Atmosphere */}
        <div className="p-4 rounded-xl bg-eco-surface/70 border border-eco-border/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <CloudSun className="h-3.5 w-3.5 text-eco-amber" /> Atmosphere
            </span>
            <span className="text-slate-400 text-[11px]">Sambalpur</span>
          </div>

          <div className="flex items-baseline justify-between my-1 font-mono">
            <div>
              <span className="text-xl font-bold text-white">{weather.tempC}°C</span>
              <span className="text-xs text-slate-400 ml-1">Temp</span>
            </div>
            <span className="text-[10px] text-eco-neon">Clear Sky</span>
          </div>

          <div className="pt-2.5 my-1 border-t border-eco-border/40 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Cloud Cover</span>
              <span className="text-white font-medium">{weather.cloudCoverPct}%</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Humidity</span>
              <span className="text-white font-medium">{weather.humidity}%</span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Zero cloud shading alert
          </div>
        </div>
      </div>
    </div>
  );
}
