import React from 'react';
import { Leaf, ArrowDownRight, ArrowUpRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export function CarbonGauge({ 
  currentCarbon = 184, 
  threshold = 250, 
  gridFrequency = 50.02,
  gridStatus = 'Optimal',
  delta = -18.4 
}) {
  // Max scale is 600 gCO2/kWh
  const maxScale = 600;
  const clampedValue = Math.min(Math.max(currentCarbon, 0), maxScale);
  const percentage = (clampedValue / maxScale) * 100;
  
  // Angle for semi-circle: 180 degrees (from -90 to +90 or 180 arc)
  // Let's use SVG circle arc:
  // Radius = 85, Circumference of full circle = 2 * PI * 85 = 534.07
  // Semi-circle arc = 267.0
  const radius = 80;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  // We use half-circle (180deg) for the gauge
  const semiCircumference = circumference / 2;
  const strokeDashoffset = semiCircumference - (percentage / 100) * semiCircumference;

  // Determine dynamic color based on carbon level
  let gaugeColor = '#00ff87';
  let gaugeGlow = 'rgba(0, 255, 135, 0.4)';
  let carbonRating = 'Ultra-Clean (Solar+Hydro Peak)';
  
  if (currentCarbon > 350) {
    gaugeColor = '#ef4444';
    gaugeGlow = 'rgba(239, 68, 68, 0.4)';
    carbonRating = 'High Carbon (Thermal Surge)';
  } else if (currentCarbon > 220) {
    gaugeColor = '#f59e0b';
    gaugeGlow = 'rgba(245, 158, 11, 0.4)';
    carbonRating = 'Moderate Intensity';
  }

  return (
    <div className="eco-glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
      {/* Background ambient glow */}
      <div 
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: gaugeColor }}
      />

      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-eco-neon/15 text-eco-neon border border-eco-neon/30">
              <Leaf className="h-4 w-4" />
            </span>
            <h3 className="font-semibold text-white text-base tracking-wide">Live Carbon Intensity</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">GRIDCO Odisha Real-Time Marginal Emission</p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={gridStatus} pulse />
          <span className="text-[10px] font-mono text-slate-500">
            Freq: <span className="text-eco-cyan font-bold">{gridFrequency.toFixed(2)} Hz</span>
          </span>
        </div>
      </div>

      {/* SVG Semi-Circle Gauge */}
      <div className="relative flex flex-col items-center justify-center my-4">
        <svg 
          viewBox="0 0 200 120" 
          className="w-64 h-36 overflow-visible"
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ff87" />
              <stop offset="50%" stopColor="#00f0ff" />
              <stop offset="75%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={gaugeGlow} />
            </filter>
          </defs>

          {/* Background track (semi-circle) */}
          <path
            d="M 20 110 A 80 80 0 0 1 180 110"
            fill="none"
            stroke="#1c2e3d"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Green Window target band (approx 100 to 220 gCO2) */}
          <path
            d="M 20 110 A 80 80 0 0 1 80 40"
            fill="none"
            stroke="rgba(0, 255, 135, 0.15)"
            strokeWidth={strokeWidth + 4}
            strokeLinecap="butt"
          />

          {/* Active progress arc */}
          <path
            d="M 20 110 A 80 80 0 0 1 180 110"
            fill="none"
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={251.3}
            strokeDashoffset={251.3 - (percentage / 100) * 251.3}
            filter="url(#gaugeShadow)"
            className="transition-all duration-700 ease-out"
          />

          {/* Scale labels */}
          <text x="18" y="125" fill="#64748b" fontSize="9" fontFamily="monospace">0</text>
          <text x="94" y="22" fill="#64748b" fontSize="9" fontFamily="monospace">300</text>
          <text x="175" y="125" fill="#64748b" fontSize="9" fontFamily="monospace">600</text>
        </svg>

        {/* Center Metric Display */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <div className="flex items-baseline gap-1">
            <span 
              className="text-4xl font-extrabold font-mono tracking-tight transition-colors duration-500"
              style={{ color: gaugeColor }}
            >
              {currentCarbon}
            </span>
            <span className="text-xs font-mono text-slate-400">gCO₂/kWh</span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`inline-flex items-center text-xs font-mono font-medium ${delta < 0 ? 'text-eco-neon' : 'text-eco-red-light'}`}>
              {delta < 0 ? (
                <ArrowDownRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowUpRight className="h-3.5 w-3.5" />
              )}
              {Math.abs(delta)}%
            </span>
            <span className="text-[11px] text-slate-500">vs 24h avg</span>
          </div>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="pt-3 border-t border-eco-border/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: gaugeColor }}
          />
          <span className="text-slate-300 font-medium text-xs truncate max-w-[210px]">{carbonRating}</span>
        </div>
        <div className="text-right font-mono text-[11px] text-slate-400">
          Target: &lt; <span className="text-eco-neon font-bold">{threshold}</span> g
        </div>
      </div>
    </div>
  );
}
