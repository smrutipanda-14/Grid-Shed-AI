export function formatNumber(val, decimals = 1) {
  if (val === undefined || val === null) return '0';
  return Number(val).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDateTime(isoString) {
  if (!isoString) return '--';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return isoString;
  }
}

export function formatTimeOnly(isoString) {
  if (!isoString) return '--';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return isoString;
  }
}

export function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'running':
    case 'executing':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-eco-neon',
        border: 'border-emerald-500/30',
        dot: 'bg-eco-neon animate-ping',
      };
    case 'pending':
    case 'reserved':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-eco-amber-light',
        border: 'border-amber-500/30',
        dot: 'bg-eco-amber',
      };
    case 'completed':
      return {
        bg: 'bg-cyan-500/10',
        text: 'text-eco-cyan',
        border: 'border-cyan-500/30',
        dot: 'bg-eco-cyan',
      };
    case 'failed':
    case 'constrained':
      return {
        bg: 'bg-red-500/10',
        text: 'text-eco-red-light',
        border: 'border-red-500/30',
        dot: 'bg-eco-red',
      };
    case 'optimal':
      return {
        bg: 'bg-emerald-500/15',
        text: 'text-eco-neon',
        border: 'border-eco-neon/40',
        dot: 'bg-eco-neon',
      };
    case 'moderate':
      return {
        bg: 'bg-amber-500/15',
        text: 'text-eco-amber-light',
        border: 'border-eco-amber/40',
        dot: 'bg-eco-amber',
      };
    default:
      return {
        bg: 'bg-slate-800',
        text: 'text-slate-300',
        border: 'border-slate-700',
        dot: 'bg-slate-400',
      };
  }
}
