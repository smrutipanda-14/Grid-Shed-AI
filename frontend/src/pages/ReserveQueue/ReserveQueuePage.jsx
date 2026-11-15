import React from 'react';
import { PriorityBadge } from '../../components/common/StatusBadge';
import { formatDateTime } from '../../utils/formatters';
import { Play, RotateCw } from 'lucide-react';

export function ReserveQueuePage({ 
  reserveQueue = [], 
  onForceDispatch, 
  gridMetrics, 
  lastReevaluationSeconds 
}) {
  const currentRenewablePct = gridMetrics?.renewablePctTotal ?? 84;

  return (
    <div className="space-y-6">
      {/* Clean Header with AI Scheduler Loop Pulse */}
      <div className="eco-card-clean p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-white tracking-tight">Reserve Queue (Curtailed Workloads)</h3>
          <p className="text-xs text-eco-muted mt-0.5 font-mono">
            Workloads deferred until grid renewable generation clears job threshold
          </p>
        </div>

        {/* Subtle Visual Indicator for the AI Scheduler Auto-Reevaluation Loop */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-eco-border bg-eco-surface/80 text-xs font-mono">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-eco-neon opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-eco-neon" />
          </div>
          <span className="text-slate-400">
            Scheduler loop re-evaluates in <span className="text-eco-neon font-bold">{lastReevaluationSeconds}s</span>
          </span>
          <RotateCw className="h-3 w-3 text-slate-500 animate-spin" style={{ animationDuration: '8s' }} />
        </div>
      </div>

      {/* Reserved Jobs Table */}
      <div className="eco-card-clean p-6">
        <div className="pb-3 mb-4 border-b border-eco-border/40 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>{reserveQueue.length} jobs held in reserve</span>
          <span>Current Grid: <strong className="text-eco-neon font-bold">{currentRenewablePct}%</strong> clean</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-eco-border/40">
                <th className="py-2.5 px-3 font-normal">Job Name</th>
                <th className="py-2.5 px-3 font-normal">Priority</th>
                <th className="py-2.5 px-3 font-normal">Reason</th>
                <th className="py-2.5 px-3 font-normal text-center">Current Grid %</th>
                <th className="py-2.5 px-3 font-normal text-center">Required Grid %</th>
                <th className="py-2.5 px-3 font-normal">Predicted Time</th>
                <th className="py-2.5 px-3 font-normal">Deadline</th>
                <th className="py-2.5 px-3 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-border/30 text-slate-300">
              {reserveQueue.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 font-sans">
                    No jobs held in reserve. All workloads are active or completed.
                  </td>
                </tr>
              ) : (
                reserveQueue.map((job) => {
                  const isEligible = currentRenewablePct >= job.requiredGridPct;

                  return (
                    <tr key={job.id} className="hover:bg-eco-card/50 transition-colors">
                      {/* Job Name */}
                      <td className="py-3 px-3 font-sans">
                        <div className="font-mono text-eco-amber-light text-[11px] font-semibold">{job.id}</div>
                        <div className="text-white font-medium text-xs truncate max-w-xs">{job.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{job.energyKWh} kWh</div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3">
                        <PriorityBadge priority={job.priority} />
                      </td>

                      {/* Reason */}
                      <td className="py-3 px-3 font-sans text-xs text-slate-400 max-w-xs">
                        <span className="line-clamp-2">{job.reasonForReservation}</span>
                      </td>

                      {/* Current Grid % */}
                      <td className="py-3 px-3 font-mono text-center text-white">
                        {currentRenewablePct}%
                      </td>

                      {/* Required Grid % */}
                      <td className="py-3 px-3 font-mono text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          isEligible ? 'text-eco-neon bg-eco-neon/15 border border-eco-neon/30' : 'text-eco-amber-light'
                        }`}>
                          {job.requiredGridPct}%
                        </span>
                      </td>

                      {/* Predicted Time */}
                      <td className="py-3 px-3 font-mono text-eco-cyan text-[11px]">
                        {job.predictedExecutionTime}
                      </td>

                      {/* Deadline */}
                      <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                        {formatDateTime(job.deadline)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onForceDispatch(job)}
                          className="px-2 py-1 rounded border border-eco-border text-slate-300 hover:text-white hover:border-eco-neon text-[11px] font-mono transition-colors inline-flex items-center gap-1"
                          title="Override curtailment"
                        >
                          <Play className="h-2.5 w-2.5" />
                          <span>Run</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
