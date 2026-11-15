import React from 'react';
import { Leaf, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export function CarbonGauge({ 
  currentCarbon = 184, 
  threshold = 250, 
  gridFrequency = 50.02,
  gridStatus = 'Optimal',
  delta = -18.4 
}) {
  const maxScale = 600;
  const clampedValue = Math.min(Math.max(currentCarbon, 0), maxScale);
  const percentage = (clampedValue / maxScale) * 100;
  
  // Clean semi-circle arc calculation
  // Radius = 76, arc length = PI * 76 = 238.76
  const arcLength = 238.76;
  const strokeDashoffset = arcLength - (percentage / 100) * arcLength;

  let gaugeColor = '#00ff87';
  let gaugeGlowClass = 'text-eco-neon';
  let statusText = 'Low Carbon Intensity';

  if (currentCarbon > 350) {
    gaugeColor = '#ef4444';
    gaugeGlowClass = 'text-eco-red-light';
    statusText = 'Fossil-Heavy Reliance';
  } else if (currentCarbon > 220) {
    gaugeColor = '#f59e0b';
    gaugeGlowClass = 'text-eco-amber-light';
    statusText = 'Moderate Carbon Intensity';
  }

  return (
    <div className="eco-card-clean p-6 flex flex-col justify-between h-full">
      {/* Sleek Header */}
      <div className="flex items-center justify-between pb-3 border-b border-eco-border/40">
        <div>
          <h3 className="text-sm font-medium text-white tracking-tight">Live Carbon Intensity</h3>
          <p className="text-xs text-eco-muted mt-0.5 font-mono">GRIDCO Odisha Real-Time Marginal</p>
        </div>
        <StatusBadge status={gridStatus} pulse />
      </div>

      {/* Sleek Semi-Circle Gauge */}
      <div className="relative flex flex-col items-center justify-center my-3">
        <svg viewBox="0 0 200 115" className="w-56 h-32 overflow-visible">
          <defs>
            <linearGradient id="sleekGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ff87" />
              <stop offset="50%" stopColor="#00f0ff" />
              <stop offset="80%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id="gaugeSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={gaugeColor} floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background Track */}
          <path
            d="M 24 105 A 76 76 0 0 1 176 105"
            fill="none"
            stroke="#16222d"
            strokeWidth="9"
            strokeLinecap="round"
          />

          {/* Active Arc */}
          <path
            d="M 24 105 A 76 76 0 0 1 176 105"
            fill="none"
            stroke={gaugeColor}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            filter="url(#gaugeSoftGlow)"
            className="transition-all duration-700 ease-out"
          />

          {/* Scale Labels */}
          <text x="22" y="120" fill="#64748b" fontSize="9" fontFamily="monospace">0</text>
          <text x="94" y="24" fill="#64748b" fontSize="9" fontFamily="monospace">300</text>
          <text x="170" y="120" fill="#64748b" fontSize="9" fontFamily="monospace">600</text>
        </svg>

        {/* Center Metric Display */}
        <div className="absolute bottom-1 flex flex-col items-center text-center">
          <div className="flex items-baseline gap-1">
            <span 
              className="text-3xl font-bold font-mono tracking-tight"
              style={{ color: gaugeColor }}
            >
              {currentCarbon}
            </span>
            <span className="text-xs font-mono text-slate-400">gCO₂/kWh</span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[11px]">
            <span className={`inline-flex items-center font-medium ${delta < 0 ? 'text-eco-neon' : 'text-eco-red-light'}`}>
              {delta < 0 ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
              {Math.abs(delta)}%
            </span>
            <span className="text-slate-500">vs 24h baseline</span>
          </div>
        </div>
      </div>

      {/* Sleek Footer */}
      <div className="pt-3 border-t border-eco-border/40 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: gaugeColor }} />
          <span className="text-slate-300 font-sans text-xs">{statusText}</span>
        </div>
        <span className="text-slate-500 text-[11px]">
          Target: &lt; <span className="text-eco-neon font-medium">{threshold}g</span>
        </span>
      </div>
    </div>
  );
}
