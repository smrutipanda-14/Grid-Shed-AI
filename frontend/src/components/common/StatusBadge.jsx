import React from 'react';
import { getStatusColor } from '../../utils/formatters';

export function StatusBadge({ status, pulse = false, size = 'md' }) {
  const style = getStatusColor(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs tracking-wider';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full uppercase border font-mono ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.dot.split(' ')[0]}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot.split(' ')[0]}`} />
      </span>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const getPriorityStyle = () => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-eco-red-light bg-eco-red/10 border-eco-red/30';
      case 'medium':
        return 'text-eco-amber-light bg-eco-amber/10 border-eco-amber/30';
      case 'low':
        return 'text-eco-cyan bg-eco-cyan/10 border-eco-cyan/30';
      default:
        return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium rounded border ${getPriorityStyle()}`}
    >
      {priority}
    </span>
  );
}
