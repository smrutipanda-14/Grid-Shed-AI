import React from 'react';
import { 
  Activity, 
  Layers, 
  Clock, 
  TrendingDown, 
  Zap 
} from 'lucide-react';

export function Sidebar({ currentTab, setCurrentTab, gridMetrics, reserveCount = 5 }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Grid Overview',
      icon: Activity,
    },
    {
      id: 'jobs',
      label: 'Job Management',
      icon: Layers,
    },
    {
      id: 'reserve',
      label: 'Reserve Queue',
      icon: Clock,
      badge: reserveCount,
    },
    {
      id: 'savings',
      label: 'Carbon Savings',
      icon: TrendingDown,
    },
  ];

  return (
    <aside className="w-60 bg-eco-surface border-r border-eco-border/60 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-eco-border/40">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-eco-neon/15 border border-eco-neon/30 flex items-center justify-center text-eco-neon shadow-neon-green-sm">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">Grid-Shed AI</h1>
            <p className="text-[10px] text-eco-muted font-mono">Carbon Orchestrator</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          Workspaces
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                isActive
                  ? 'bg-eco-card text-white font-medium border-l-2 border-eco-neon shadow-neon-green-sm'
                  : 'text-slate-400 hover:text-white hover:bg-eco-card/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-eco-neon' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-eco-amber-light bg-eco-amber/15 border border-eco-amber/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Grid Status */}
      <div className="p-4 border-t border-eco-border/40 text-[11px] font-mono text-slate-500">
        <div className="flex items-center justify-between mb-1">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-eco-neon animate-pulse" />
            GRIDCO 50Hz
          </span>
          <span className="text-eco-neon font-bold">{gridMetrics?.gridFrequency?.toFixed(2) ?? '50.02'} Hz</span>
        </div>
        <div className="text-[10px] text-slate-500">Odisha Data Center Node</div>
      </div>
    </aside>
  );
}
