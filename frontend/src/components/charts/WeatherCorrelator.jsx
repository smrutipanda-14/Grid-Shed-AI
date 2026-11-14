import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Sun, CloudSun, Droplets, Thermometer, Wind, Gauge, Compass } from 'lucide-react';

export function WeatherCorrelator({ weather }) {
  if (!weather) return null;

  // Convert sparkline arrays to Recharts friendly format
  const irradianceData = weather.irradianceSparkline.map((val, idx) => ({ idx, val }));
  const hydroData = weather.hydroHeadSparkline.map((val, idx) => ({ idx, val }));

  return (
    <div className="eco-glass-card rounded-2xl p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-eco-cyan/15 text-eco-cyan border border-eco-cyan/30">
              <CloudSun className="h-4 w-4" />
            </span>
            <h3 className="font-semibold text-white text-base tracking-wide">
              Weather & Renewable Correlator
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Atmospheric irradiance and Hirakud hydro reservoir telemetry impacting green dispatch
          </p>
        </div>

        <div className="px-2.5 py-1 rounded-md bg-eco-neon/10 border border-eco-neon/30 text-eco-neon text-xs font-mono">
          Correlation: 0.94 (Strong)
        </div>
      </div>

      {/* Grid of Micro-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Atmospheric Conditions */}
        <div className="p-4 rounded-xl bg-eco-surface/80 border border-eco-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Thermometer className="h-3.5 w-3.5 text-eco-amber" /> Atmosphere
            </span>
            <span className="text-eco-neon">Sambalpur / Cuttack</span>
          </div>

          <div className="my-1">
            <div className="text-xl font-bold text-white font-mono flex items-baseline gap-2">
              <span>{weather.tempC}°C</span>
              <span className="text-xs font-sans text-slate-400 font-normal">{weather.condition}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">High direct normal irradiance zone</p>
          </div>

          <div className="pt-3 mt-2 border-t border-eco-border/60 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 block">Cloud Cover</span>
              <span className="text-slate-200 font-bold">{weather.cloudCoverPct}% (Low)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Humidity</span>
              <span className="text-slate-200 font-bold">{weather.humidity}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Solar Irradiance Micro-Chart */}
        <div className="p-4 rounded-xl bg-eco-surface/80 border border-eco-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Sun className="h-3.5 w-3.5 text-eco-neon" /> Solar Irradiance
            </span>
            <span className="text-eco-neon font-bold">{weather.irradianceStatus}</span>
          </div>

          <div className="flex items-baseline justify-between mt-1 mb-2 font-mono">
            <div>
              <span className="text-2xl font-bold text-white">{weather.irradianceWM2}</span>
              <span className="text-xs text-slate-400 ml-1">W/m²</span>
            </div>
            <span className="text-[11px] text-eco-neon font-semibold">+14% vs avg</span>
          </div>

          {/* Irradiance Sparkline */}
          <div className="h-12 w-full my-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={irradianceData}>
                <defs>
                  <linearGradient id="irradianceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ff87" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#00ff87" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="val" 
                  stroke="#00ff87" 
                  strokeWidth={2} 
                  fill="url(#irradianceGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] font-mono text-slate-500 flex justify-between">
            <span>06:00 (120 W/m²)</span>
            <span className="text-eco-neon">Peak: 850 W/m²</span>
            <span>18:00 (90 W/m²)</span>
          </div>
        </div>

        {/* Card 3: Hydro Reservoir Head Level */}
        <div className="p-4 rounded-xl bg-eco-surface/80 border border-eco-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5 text-eco-cyan" /> Hirakud Hydro Head
            </span>
            <span className="text-eco-cyan font-bold">{weather.hydroCapacityPct}% Cap</span>
          </div>

          <div className="flex items-baseline justify-between mt-1 mb-2 font-mono">
            <div>
              <span className="text-2xl font-bold text-white">{weather.hydroHeadMeters}</span>
              <span className="text-xs text-slate-400 ml-1">meters</span>
            </div>
            <span className="text-[11px] text-slate-400">Inflow: {weather.hydroInflowRate}</span>
          </div>

          {/* Hydro Head Sparkline */}
          <div className="h-12 w-full my-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hydroData}>
                <defs>
                  <linearGradient id="hydroGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#00f0ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="val" 
                  stroke="#00f0ff" 
                  strokeWidth={2} 
                  fill="url(#hydroGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Optimal Head &gt; 190m</span>
            <span className="text-eco-cyan">Dispatch Ready: 1,370 MW</span>
          </div>
        </div>
      </div>
    </div>
  );
}
