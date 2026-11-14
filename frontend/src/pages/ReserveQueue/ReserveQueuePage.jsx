import React, { useState } from 'react';
import { 
  Clock, 
  RefreshCw, 
  AlertTriangle, 
  Zap, 
  ArrowUpRight, 
  ShieldAlert, 
  CheckCircle2, 
  SlidersHorizontal,
  PlayCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { PriorityBadge } from '../../components/common/StatusBadge';
import { formatDateTime } from '../../utils/formatters';

export function ReserveQueuePage({ 
  reserveQueue = [], 
  onForceDispatch, 
  onTriggerSurge,
  gridMetrics, 
  lastReevaluationSeconds 
}) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const handleForceDispatch = (job) => {
    onForceDispatch(job);
    setToastMessage(`Manual Override: ${job.name} pushed to execution cluster.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSimulateSurge = () => {
    onTriggerSurge();
    setToastMessage(`Green surge simulated! Re-evaluating Celery task queue...`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const currentRenewablePct = gridMetrics?.renewablePctTotal ?? 84;
  const currentCarbon = gridMetrics?.currentCarbonIntensity ?? 184;

  return (
    <div className="space-y-6">
      {/* Top Banner: Scheduler Re-evaluation Loop & Telemetry Status */}
      <div className="eco-glass-card rounded-2xl p-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-eco-amber/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-eco-amber/15 text-eco-amber border border-eco-amber/30">
                <Clock className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-white text-lg tracking-wide">
                Autonomous Carbon Reserve Queue (Held Workloads)
              </h3>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              These non-urgent workloads are dynamically curtailed by the Grid-Shed AI engine.
              They are queued in memory and re-evaluated every minute against GRIDCO / OPTCL renewable generation ramp-ups to prevent fossil fuel spinning reserve dispatch.
            </p>
          </div>

          {/* Live Scheduler Loop Status Card */}
          <div className="p-4 rounded-xl bg-eco-surface border border-eco-border shrink-0 flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-eco-neon/30 flex items-center justify-center animate-pulse">
                <RefreshCw className="h-5 w-5 text-eco-neon animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-eco-neon animate-ping" />
            </div>

            <div className="font-mono text-xs">
              <div className="text-slate-400">Celery Evaluation Loop</div>
              <div className="text-white font-bold text-sm">
                Next Audit: <span className="text-eco-neon">{lastReevaluationSeconds}s</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Frequency: 60s Interval
              </div>
            </div>

            <button
              onClick={handleSimulateSurge}
              className="px-3 py-2 rounded-lg bg-eco-neon/15 border border-eco-neon/40 text-eco-neon text-xs font-mono font-bold hover:bg-eco-neon/25 transition-all flex items-center gap-1.5"
              title="Simulate solar spike to trigger auto-dispatch"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Trigger Green Surge
            </button>
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-eco-border/80 text-xs font-mono">
          <div>
            <span className="text-slate-500 block">Curtailed Workloads</span>
            <span className="text-xl font-bold text-eco-amber-light">{reserveQueue.length} Jobs</span>
          </div>
          <div>
            <span className="text-slate-500 block">Total Deferred Energy</span>
            <span className="text-xl font-bold text-white">
              {reserveQueue.reduce((acc, j) => acc + (j.energyKWh || j.energy_requirement || 0), 0)} kWh
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Potential CO₂ Abatement</span>
            <span className="text-xl font-bold text-eco-neon">
              ~{reserveQueue.reduce((acc, j) => acc + (j.estimatedAvoidedCO2Kg || j.co2_avoided || 0), 0).toFixed(1)} kg
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Earliest Predicted Launch</span>
            <span className="text-xl font-bold text-eco-cyan">11:45 AM</span>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-lg bg-eco-card border border-eco-neon/40 text-eco-neon text-xs font-mono flex items-center justify-between shadow-neon-green-sm">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Reserve Queue Table */}
      <div className="eco-glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-white text-base">Reserved Workload Queue</h4>
            <p className="text-xs text-slate-400">
              Workloads awaiting optimal renewable threshold match or nearing hard deadlines
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-eco-neon" />
            <span>Current Grid Mix: <strong className="text-white">{currentRenewablePct}%</strong> Renewable</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-eco-border">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-eco-surface border-b border-eco-border text-slate-400 uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 font-semibold">Job Name</th>
                <th className="py-3 px-4 font-semibold">Priority</th>
                <th className="py-3 px-4 font-semibold">Reason for Reservation</th>
                <th className="py-3 px-4 font-semibold text-center">Current Grid %</th>
                <th className="py-3 px-4 font-semibold text-center">Required Grid %</th>
                <th className="py-3 px-4 font-semibold">Predicted Execution</th>
                <th className="py-3 px-4 font-semibold">Deadline</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-border/60 text-slate-300">
              {reserveQueue.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 font-sans">
                    Queue is empty. All submitted workloads are currently running or fulfilled!
                  </td>
                </tr>
              ) : (
                reserveQueue.map((job) => {
                  const reqGrid = job.requiredGridPct ?? job.required_renewable_pct ?? 65;
                  const thresholdMet = currentRenewablePct >= reqGrid;

                  return (
                    <tr 
                      key={job.id} 
                      className={`hover:bg-eco-card/60 transition-colors ${
                        thresholdMet ? 'bg-emerald-950/20' : ''
                      }`}
                    >
                      {/* Job Name */}
                      <td className="py-3 px-4 font-sans">
                        <div className="font-mono text-eco-amber-light text-xs font-semibold">
                          {job.id}
                        </div>
                        <div className="text-white font-medium text-xs truncate max-w-xs" title={job.name}>
                          {job.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {job.energyKWh || job.energy_requirement || 0} kWh · Est. ~{job.estimatedAvoidedCO2Kg || job.co2_avoided || 0} kg CO₂ saved
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4">
                        <PriorityBadge priority={job.priority} />
                      </td>

                      {/* Reason for Reservation */}
                      <td className="py-3 px-4 font-sans text-xs text-slate-300 max-w-sm">
                        <div className="flex items-start gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-eco-amber shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{job.reasonForReservation || job.reserve_reason || 'Held for optimal green window'}</span>
                        </div>
                      </td>

                      {/* Current Grid % */}
                      <td className="py-3 px-4 font-mono text-center">
                        <span className="px-2 py-0.5 rounded bg-eco-surface font-bold text-slate-200 border border-eco-border">
                          {currentRenewablePct}%
                        </span>
                      </td>

                      {/* Required Grid % */}
                      <td className="py-3 px-4 font-mono text-center">
                        <span className={`px-2 py-0.5 rounded font-bold border ${
                          thresholdMet 
                            ? 'bg-emerald-950 text-eco-neon border-eco-neon/40' 
                            : 'bg-amber-950/40 text-eco-amber-light border-eco-amber/40'
                        }`}>
                          {reqGrid}%
                        </span>
                      </td>

                      {/* Predicted Execution Time */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5 text-eco-cyan font-semibold">
                          <Clock className="h-3 w-3" />
                          <span>{job.predictedExecutionTime || job.expected_execution_time || '12:30 PM (in 45m)'}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">During Solar/Hydro peak</span>
                      </td>

                      {/* Deadline */}
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {formatDateTime(job.deadline)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleForceDispatch(job)}
                          className="px-2.5 py-1 rounded bg-eco-surface border border-eco-border text-eco-amber-light hover:text-white hover:border-eco-amber hover:bg-eco-amber/20 font-mono text-[11px] transition-all whitespace-nowrap flex items-center gap-1 ml-auto"
                          title="Override carbon interlock and execute immediately"
                        >
                          <PlayCircle className="h-3 w-3" /> Force Run
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-eco-border flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-eco-amber" />
              Held back until renewable % &gt;= Required threshold
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-eco-neon" />
              Auto-releases if hard deadline is within 60 minutes
            </span>
          </div>
          <div>
            GRIDCO Substation Node: Khurda / Chandaka 400kV
          </div>
        </div>
      </div>
    </div>
  );
}
