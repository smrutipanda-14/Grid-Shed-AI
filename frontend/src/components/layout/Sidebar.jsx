import React from 'react';
import { 
  Activity, 
  Layers, 
  Clock, 
  TrendingDown, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Server
} from 'lucide-react';

export function Sidebar({ currentTab, setCurrentTab, gridMetrics }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Grid Overview',
      subtitle: 'Live Telemetry & Forecast',
      icon: Activity,
    },
    {
      id: 'jobs',
      label: 'Job Management',
      subtitle: 'Workloads & Submission',
      icon: Layers,
    },
    {
      id: 'reserve',
      label: 'Reserve Queue',
      subtitle: 'Curtailed / Held Workloads',
      icon: Clock,
      badge: 5, // 5 reserved jobs in mock
    },
    {
      id: 'savings',
      label: 'Carbon Savings',
      subtitle: 'Avoided Emissions & ROI',
      icon: TrendingDown,
    },
  ];

  return (
    <aside className="w-64 bg-eco-surface border-r border-eco-border flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-eco-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-eco-neon/20 via-eco-cyan/20 to-emerald-900/40 border border-eco-neon/40 flex items-center justify-center shadow-neon-green-sm">
            <Zap className="h-5 w-5 text-eco-neon" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base tracking-wide text-white">Grid-Shed AI</h1>
              <span className="px-1.5 py-0.2 text-[10px] font-mono uppercase bg-eco-neon/15 text-eco-neon border border-eco-neon/30 rounded">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-eco-muted font-mono tracking-tight">Odisha Data Center Node</p>
          </div>
        </div>
      </div>

      {/* Grid Region & Source Ticker */}
      <div className="px-5 py-3 bg-eco-dark/60 border-b border-eco-border/60">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 flex items-center gap-1">
            <Server className="h-3 w-3 text-eco-cyan" /> GRIDCO/OPTCL
          </span>
          <span className="text-eco-neon flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-eco-neon animate-pulse"></span>
            Sync Active
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          Core Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-eco-card to-eco-surface border-l-4 border-eco-neon text-white shadow-neon-green-sm border-y border-r border-eco-border'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-eco-card/50'
              }`}
            >
              <div
                className={`p-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-eco-neon/15 text-eco-neon'
                    : 'bg-eco-surface/80 text-slate-400 group-hover:text-eco-neon group-hover:bg-eco-neon/10'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-full bg-eco-amber/20 text-eco-amber-light border border-eco-amber/40">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Grid Telemetry Snapshot Widget in Footer */}
      <div className="p-4 border-t border-eco-border bg-eco-dark/80">
        <div className="rounded-lg p-3 bg-eco-surface border border-eco-border/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-mono text-[11px]">Carbon Intensity</span>
            <span className="font-mono font-bold text-eco-neon">
              {gridMetrics?.currentCarbonIntensity ?? 184} <span className="text-[10px] text-slate-400 font-normal">g/kWh</span>
            </span>
          </div>

          <div className="w-full bg-eco-card rounded-full h-1.5 overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-eco-neon to-eco-cyan h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, ((gridMetrics?.currentCarbonIntensity ?? 184) / 500) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Renewable: <strong className="text-eco-neon">{gridMetrics?.renewablePctTotal ?? 84}%</strong></span>
            <span>Freq: <strong className="text-eco-cyan">{gridMetrics?.gridFrequency ?? 50.02}Hz</strong></span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-eco-green" /> Grid Safety Interlock
          </span>
          <span className="text-eco-neon">ARMED</span>
        </div>
      </div>
    </aside>
  );
}
