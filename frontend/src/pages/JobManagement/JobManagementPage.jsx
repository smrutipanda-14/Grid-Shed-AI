import React, { useState } from 'react';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { formatDateTime } from '../../utils/formatters';
import { CheckCircle2, Clock } from 'lucide-react';

export function JobManagementPage({ 
  jobs = [], 
  onAddJob, 
  gridMetrics,
  onNavigate 
}) {
  const [activeTabFilter, setActiveTabFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [jobName, setJobName] = useState('');
  const [jobType, setJobType] = useState('AI Training');
  const [energyReq, setEnergyReq] = useState(450);
  const [priority, setPriority] = useState('Medium');
  const [deadline, setDeadline] = useState('2026-11-15T22:00');
  const [flexibility, setFlexibility] = useState('Flexible');
  const [submitFeedback, setSubmitFeedback] = useState(null);

  const currentRenewablePct = gridMetrics?.renewablePctTotal ?? 84;
  const currentCarbon = gridMetrics?.currentCarbonIntensity ?? 184;
  const isGridGreen = currentRenewablePct >= 75 && currentCarbon < 250;
  const willExecuteImmediately = isGridGreen || flexibility === 'Urgent';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jobName.trim()) return;

    const newJobId = `JOB-${Math.floor(1000 + Math.random() * 9000)}`;
    const status = willExecuteImmediately ? 'Running' : 'Pending';

    const newJob = {
      id: newJobId,
      name: jobName,
      type: jobType,
      energyRequirement: Number(energyReq),
      priority,
      deadline,
      flexibility,
      status,
      progress: status === 'Running' ? 10 : 0,
      submittedAt: new Date().toISOString(),
      executedAt: status === 'Running' ? new Date().toISOString() : null,
      expectedExecutionTime: status === 'Running' ? 'Immediate' : '11:45 AM (Green Window)',
      reserveReason: status === 'Pending' ? 'Held for optimal 11:45 AM solar generation peak' : null,
      nodesAllocated: Math.max(8, Math.round(Number(energyReq) / 40)),
    };

    onAddJob(newJob);
    setSubmitFeedback({
      id: newJobId,
      name: jobName,
      status,
      decision: willExecuteImmediately ? 'EXECUTE NOW' : 'RESERVE JOB',
      message: willExecuteImmediately
        ? `Dispatched immediately. Grid condition is optimal (${currentRenewablePct}% renewables).`
        : `Moved to Reserve Queue. Auto-scheduled for upcoming green window.`,
    });

    setJobName('');
    setEnergyReq(450);
    setTimeout(() => setSubmitFeedback(null), 5000);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = activeTabFilter === 'ALL' || job.status === activeTabFilter;
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const runningCount = jobs.filter(j => j.status === 'Running').length;
  const pendingCount = jobs.filter(j => j.status === 'Pending').length;
  const completedCount = jobs.filter(j => j.status === 'Completed').length;

  return (
    <div className="space-y-8">
      {/* SECTION 1: Clean, Card-based Job Submission Form */}
      <div className="eco-card-clean p-6">
        <div className="pb-3 mb-6 border-b border-eco-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium text-white tracking-tight">Workload Intake & Dispatch</h3>
            <p className="text-xs text-eco-muted mt-0.5 font-mono">
              Submit computational workloads for carbon-aware scheduling against GRIDCO parameters
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400">
            AI Engine: <span className="text-eco-neon font-medium">AUTONOMOUS</span>
          </div>
        </div>

        {submitFeedback && (
          <div className={`mb-6 p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
            submitFeedback.status === 'Running'
              ? 'border-eco-neon/30 bg-eco-neon/10 text-eco-neon'
              : 'border-eco-amber/30 bg-eco-amber/10 text-eco-amber-light'
          }`}>
            <div className="flex items-center gap-2">
              {submitFeedback.status === 'Running' ? (
                <CheckCircle2 className="h-4 w-4 text-eco-neon" />
              ) : (
                <Clock className="h-4 w-4 text-eco-amber" />
              )}
              <span>
                <strong className="text-white">{submitFeedback.id}</strong> — {submitFeedback.message}
              </span>
            </div>
            <button onClick={() => setSubmitFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Field 1: Job Name */}
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-xs font-mono text-slate-300">
                Job Name / Model Description
              </label>
              <input
                type="text"
                required
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder="e.g. Llama-3-70B Odisha Dialect Fine-Tuning"
                className="w-full bg-eco-surface/70 border border-eco-border rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-eco-neon/50 transition-colors font-sans"
              />
            </div>

            {/* Field 2: Job Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">
                Workload Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full bg-eco-surface/70 border border-eco-border rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-eco-neon/50 font-mono"
              >
                <option value="AI Training">AI Training (GPU Clusters)</option>
                <option value="Data Processing">Data Processing (CPU/ETL)</option>
              </select>
            </div>

            {/* Field 3: Energy Requirement */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Energy Requirement</span>
                <span className="text-eco-neon font-bold">{energyReq} kWh</span>
              </div>
              <input
                type="range"
                min="50"
                max="3000"
                step="25"
                value={energyReq}
                onChange={(e) => setEnergyReq(Number(e.target.value))}
                className="w-full h-1 bg-eco-surface rounded-lg appearance-none cursor-pointer accent-eco-neon"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>50 kWh</span>
                <span>1,500 kWh</span>
                <span>3,000 kWh</span>
              </div>
            </div>

            {/* Field 4: Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">
                Scheduling Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['High', 'Medium', 'Low'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-xs font-mono rounded-lg border transition-colors ${
                      priority === p
                        ? p === 'High'
                          ? 'border-eco-red/50 bg-eco-red/15 text-eco-red-light'
                          : p === 'Medium'
                          ? 'border-eco-amber/50 bg-eco-amber/15 text-eco-amber-light'
                          : 'border-eco-cyan/50 bg-eco-cyan/15 text-eco-cyan'
                        : 'border-eco-border bg-eco-surface/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 5: Deadline */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">
                Hard Deadline
              </label>
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-eco-surface/70 border border-eco-border rounded-lg px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-eco-neon/50 font-mono"
              />
            </div>

            {/* Field 6: Flexibility */}
            <div className="space-y-1.5 lg:col-span-3">
              <label className="text-xs font-mono text-slate-300">
                Dispatch Flexibility
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFlexibility('Flexible')}
                  className={`p-3 rounded-lg border text-left transition-colors font-mono text-xs ${
                    flexibility === 'Flexible'
                      ? 'border-eco-neon/40 bg-eco-neon/10 text-white shadow-neon-green-sm'
                      : 'border-eco-border bg-eco-surface/40 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-eco-neon">Flexible (Recommended)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Allows shifting to 10 AM - 3 PM peak renewable surplus</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFlexibility('Urgent')}
                  className={`p-3 rounded-lg border text-left transition-colors font-mono text-xs ${
                    flexibility === 'Urgent'
                      ? 'border-eco-amber/40 bg-eco-amber/10 text-white shadow-neon-amber'
                      : 'border-eco-border bg-eco-surface/40 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-eco-amber-light">Urgent (Immediate)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Dispatches immediately without waiting for green window</div>
                </button>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-eco-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-mono text-slate-400">
              {willExecuteImmediately ? (
                <span className="text-eco-neon">⚡ High renewable share ({currentRenewablePct}%) — will dispatch immediately.</span>
              ) : (
                <span>Holding in Reserve Queue until green threshold is cleared (~11:45 AM).</span>
              )}
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-eco-neon text-eco-darkest font-mono text-xs font-bold uppercase tracking-wider hover:bg-eco-neon/90 shadow-neon-green-sm transition-all"
            >
              Submit Workload
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: Minimalist Data Table (Subtle row dividers, no heavy borders) */}
      <div className="eco-card-clean p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-eco-border/40">
          <div>
            <h3 className="text-sm font-medium text-white tracking-tight">Workload Queue</h3>
            <p className="text-xs text-eco-muted mt-0.5 font-mono">Active and scheduled workloads</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-eco-surface border border-eco-border rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-eco-neon font-mono w-44"
            />

            {/* Filter Tabs */}
            <div className="flex rounded-lg border border-eco-border bg-eco-surface/60 p-0.5 text-xs font-mono">
              <button
                onClick={() => setActiveTabFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTabFilter === 'ALL' ? 'bg-eco-card text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({jobs.length})
              </button>
              <button
                onClick={() => setActiveTabFilter('Running')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTabFilter === 'Running' ? 'bg-eco-card text-eco-neon font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Running ({runningCount})
              </button>
              <button
                onClick={() => setActiveTabFilter('Pending')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTabFilter === 'Pending' ? 'bg-eco-card text-eco-amber-light font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTabFilter('Completed')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTabFilter === 'Completed' ? 'bg-eco-card text-eco-cyan font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Done ({completedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Minimal Table with Subtle Row Dividers */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-eco-border/40">
                <th className="py-2.5 px-3 font-normal">Job ID & Name</th>
                <th className="py-2.5 px-3 font-normal">Type</th>
                <th className="py-2.5 px-3 font-normal">Energy</th>
                <th className="py-2.5 px-3 font-normal">Priority</th>
                <th className="py-2.5 px-3 font-normal">Flexibility</th>
                <th className="py-2.5 px-3 font-normal">Status</th>
                <th className="py-2.5 px-3 font-normal">Schedule</th>
                <th className="py-2.5 px-3 font-normal text-right">CO₂ Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-border/30 text-slate-300">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 font-sans">
                    No matching workloads found.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-eco-card/50 transition-colors">
                    <td className="py-3 px-3 font-sans">
                      <div className="font-mono text-eco-cyan text-[11px] font-semibold">{job.id}</div>
                      <div className="text-white font-medium text-xs truncate max-w-xs">{job.name}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-[11px] font-mono">
                      {job.type}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className="text-white font-bold">{job.energyRequirement}</span>{' '}
                      <span className="text-slate-500 text-[10px]">kWh</span>
                    </td>
                    <td className="py-3 px-3">
                      <PriorityBadge priority={job.priority} />
                    </td>
                    <td className="py-3 px-3 text-[11px] font-mono text-slate-400">
                      {job.flexibility}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={job.status} pulse={job.status === 'Running'} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-[11px] font-mono text-slate-400">
                      {job.status === 'Running' ? (
                        <span className="text-eco-neon">{job.progress}% active</span>
                      ) : job.status === 'Pending' ? (
                        <span className="text-eco-amber-light">{job.expectedExecutionTime || 'Waiting'}</span>
                      ) : (
                        <span>Done</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-right">
                      {job.carbonSavedKg ? (
                        <span className="text-eco-neon font-bold">+{job.carbonSavedKg} kg</span>
                      ) : (
                        <span className="text-slate-500">~{Math.round(job.energyRequirement * 0.28)} kg</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
