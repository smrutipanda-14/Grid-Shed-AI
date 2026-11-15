import React from 'react';

export function StatusBadge({ status, pulse = false, size = 'md' }) {
  const getStyle = () => {
    switch (status?.toLowerCase()) {
      case 'running':
      case 'executing':
      case 'optimal':
        return {
          bg: 'bg-eco-neon/10',
          text: 'text-eco-neon',
          border: 'border-eco-neon/30',
          dot: 'bg-eco-neon',
          glow: 'shadow-neon-green-sm',
        };
      case 'pending':
      case 'reserved':
      case 'moderate':
        return {
          bg: 'bg-eco-amber/10',
          text: 'text-eco-amber-light',
          border: 'border-eco-amber/30',
          dot: 'bg-eco-amber',
          glow: 'shadow-neon-amber',
        };
      case 'completed':
        return {
          bg: 'bg-eco-cyan/10',
          text: 'text-eco-cyan',
          border: 'border-eco-cyan/30',
          dot: 'bg-eco-cyan',
          glow: 'shadow-neon-cyan-sm',
        };
      case 'constrained':
      case 'failed':
        return {
          bg: 'bg-eco-red/10',
          text: 'text-eco-red-light',
          border: 'border-eco-red/30',
          dot: 'bg-eco-red',
          glow: 'shadow-neon-red',
        };
      default:
        return {
          bg: 'bg-eco-surface',
          text: 'text-slate-400',
          border: 'border-eco-border',
          dot: 'bg-slate-500',
          glow: '',
        };
    }
  };

  const style = getStyle();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${style.dot}`} />
      </span>
      <span>{status}</span>
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const getStyle = () => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-eco-red-light border-eco-red/30 bg-eco-red/10';
      case 'medium':
        return 'text-eco-amber-light border-eco-amber/30 bg-eco-amber/10';
      case 'low':
        return 'text-eco-cyan border-eco-cyan/30 bg-eco-cyan/10';
      default:
        return 'text-slate-400 border-eco-border bg-transparent';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono rounded border ${getStyle()}`}>
      {priority}
    </span>
  );
}
