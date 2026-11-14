import React, { useState } from 'react';
import { 
  PlusCircle, 
  Layers, 
  Play, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Cpu, 
  Calendar, 
  Sliders, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { formatDateTime, formatNumber } from '../../utils/formatters';

export function JobManagementPage({ 
  jobs = [], 
  onAddJob, 
  gridMetrics,
  onNavigate 
}) {
  const [activeTabFilter, setActiveTabFilter] = useState('ALL'); // 'ALL' | 'Running' | 'Pending' | 'Completed'
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [jobName, setJobName] = useState('');
  const [jobType, setJobType] = useState('AI Training');
  const [energyReq, setEnergyReq] = useState(450);
  const [priority, setPriority] = useState('Medium');
  const [deadline, setDeadline] = useState('2026-11-14T20:00');
  const [flexibility, setFlexibility] = useState('Flexible');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState(null);

  // AI Decision logic preview
  const currentRenewablePct = gridMetrics?.renewablePctTotal ?? 84;
  const currentCarbon = gridMetrics?.currentCarbonIntensity ?? 184;
  const isGridGreen = currentRenewablePct >= 75 && currentCarbon < 250;
  
  // Predict decision
  const willExecuteImmediately = isGridGreen || flexibility === 'Urgent';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobName.trim()) return;

    setIsSubmitting(true);

    const newJobId = `JOB-${Math.floor(1000 + Math.random() * 9000)}`;
    const status = willExecuteImmediately ? 'Executing' : 'Reserved';

    const jobPayload = {
      id: newJobId,
      name: jobName,
      type: jobType,
      energy_requirement: Number(energyReq),
      energyRequirement: Number(energyReq),
      priority,
      deadline,
      flexibility,
      status,
      progress: willExecuteImmediately ? 5 : 0,
      submittedAt: new Date().toISOString(),
      executedAt: willExecuteImmediately ? new Date().toISOString() : null,
      expectedExecutionTime: willExecuteImmediately ? 'Immediate' : 'Today, 12:30 PM (Green Window)',
      reserveReason: !willExecuteImmediately ? 'Held for optimal 12:30 PM solar/hydro generation peak' : null,
      nodesAllocated: Math.max(8, Math.round(Number(energyReq) / 40)),
    };

    let createdJob = jobPayload;
    if (onAddJob) {
      try {
        const res = await onAddJob(jobPayload);
        if (res) createdJob = res;
      } catch (err) {
        console.warn("API add job fallback:", err);
      }
    }

    const isRunning = createdJob.status === 'Running' || createdJob.status === 'Executing';

    setIsSubmitting(false);
    setSubmitFeedback({
      id: createdJob.id || newJobId,
      name: createdJob.name || jobName,
      status: isRunning ? 'Running' : 'Pending',
      decision: isRunning ? 'EXECUTE NOW' : 'RESERVE JOB',
      message: isRunning
        ? `Dispatched immediately! Grid is green (${currentRenewablePct}% renewables).`
        : `Queued into Reserve Queue to curtail emissions. Will auto-dispatch during peak solar.`,
    });

    // Reset form
    setJobName('');
    setEnergyReq(450);

    // Dismiss feedback after 6 seconds
    setTimeout(() => setSubmitFeedback(null), 6000);
  };

  // Filtered jobs
  const isStatusMatch = (jobStatus, filter) => {
    if (filter === 'ALL') return true;
    if (filter === 'Running') return jobStatus === 'Running' || jobStatus === 'Executing';
    if (filter === 'Pending') return jobStatus === 'Pending' || jobStatus === 'Reserved';
    if (filter === 'Completed') return jobStatus === 'Completed';
    return jobStatus === filter;
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = isStatusMatch(job.status, activeTabFilter);
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const runningCount = jobs.filter(j => j.status === 'Running' || j.status === 'Executing').length;
  const pendingCount = jobs.filter(j => j.status === 'Pending' || j.status === 'Reserved').length;
  const completedCount = jobs.filter(j => j.status === 'Completed').length;

  return (
    <div className="space-y-8">
      {/* SECTION 1: Job Submission Form */}
      <div className="eco-glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-eco-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-eco-neon/15 text-eco-neon border border-eco-neon/30">
                <PlusCircle className="h-4 w-4" />
              </span>
              <h3 className="font-semibold text-white text-lg tracking-wide">
                Workload Intake & AI Decision Engine
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Submit AI models or data processing pipelines. Grid-Shed dynamically evaluates GRIDCO carbon conditions.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-eco-surface border border-eco-border text-xs font-mono text-slate-300 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-eco-neon animate-pulse" />
            <span>AI Scheduler: <strong className="text-eco-neon">AUTONOMOUS</strong></span>
          </div>
        </div>

        {submitFeedback && (
          <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 transition-all ${
            submitFeedback.status === 'Running' 
              ? 'bg-emerald-950/40 border-eco-neon/50 text-emerald-200 shadow-neon-green-sm' 
              : 'bg-amber-950/40 border-eco-amber/50 text-amber-200'
          }`}>
            {submitFeedback.status === 'Running' ? (
              <CheckCircle className="h-5 w-5 text-eco-neon shrink-0 mt-0.5" />
            ) : (
              <Clock className="h-5 w-5 text-eco-amber shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <div className="flex items-center gap-2">
                <strong className="text-white font-mono">{submitFeedback.id} - {submitFeedback.name}</strong>
                <span className="px-1.5 py-0.5 rounded font-mono font-bold uppercase text-[10px] bg-black/40">
                  {submitFeedback.decision}
                </span>
              </div>
              <p className="mt-0.5">{submitFeedback.message}</p>
            </div>
            <button 
              onClick={() => setSubmitFeedback(null)} 
              className="text-slate-400 hover:text-white text-xs"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Field 1: Job Name */}
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-mono text-slate-300 font-medium flex items-center justify-between">
                <span>Job Name / Description</span>
                <span className="text-[11px] text-slate-500 font-normal">e.g. LLM Fine-Tuning</span>
              </label>
              <input
                type="text"
                required
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder="e.g. Llama-3 Odia Dialect Training / Landsat InSAR Batch"
                className="w-full bg-eco-surface border border-eco-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-eco-neon focus:ring-1 focus:ring-eco-neon transition-colors"
              />
            </div>

            {/* Field 2: Job Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-medium flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-eco-cyan" /> Workload Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full bg-eco-surface border border-eco-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-eco-cyan focus:ring-1 focus:ring-eco-cyan"
              >
                <option value="AI Training">AI Training (GPU Intensive)</option>
                <option value="Data Processing">Data Processing (CPU/ETL Pipeline)</option>
              </select>
            </div>

            {/* Field 3: Energy Requirement (kWh) */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-medium flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-eco-amber" /> Energy Requirement
                </span>
                <span className="text-eco-neon font-bold font-mono">{energyReq} kWh</span>
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="50"
                  max="3000"
                  step="25"
                  value={energyReq}
                  onChange={(e) => setEnergyReq(Number(e.target.value))}
                  className="w-full h-1.5 bg-eco-surface rounded-lg appearance-none cursor-pointer accent-eco-neon"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>50 kWh</span>
                  <span>1,500 kWh</span>
                  <span>3,000 kWh</span>
                </div>
              </div>
            </div>

            {/* Field 4: Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-medium">
                Scheduling Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['High', 'Medium', 'Low'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 text-xs font-mono font-medium rounded-lg border transition-all ${
                      priority === p
                        ? p === 'High'
                          ? 'bg-eco-red/20 text-eco-red-light border-eco-red/50 shadow-neon-red'
                          : p === 'Medium'
                          ? 'bg-eco-amber/20 text-eco-amber-light border-eco-amber/50 shadow-neon-amber'
                          : 'bg-eco-cyan/20 text-eco-cyan border-eco-cyan/50 shadow-neon-cyan'
                        : 'bg-eco-surface text-slate-400 border-eco-border hover:bg-eco-card'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 5: Deadline */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-medium flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Hard Deadline
              </label>
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-eco-surface border border-eco-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-eco-neon font-mono"
              />
            </div>

            {/* Field 6: Flexibility */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-medium flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-eco-neon" /> Dispatch Flexibility
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFlexibility('Flexible')}
                  className={`py-2 px-3 text-xs font-mono rounded-lg border text-left transition-all ${
                    flexibility === 'Flexible'
                      ? 'bg-eco-neon/15 text-eco-neon border-eco-neon/50 shadow-neon-green-sm'
                      : 'bg-eco-surface text-slate-400 border-eco-border hover:bg-eco-card'
                  }`}
                >
                  <div className="font-bold">Flexible</div>
                  <div className="text-[10px] text-slate-400">Shift to greenest hour</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFlexibility('Urgent')}
                  className={`py-2 px-3 text-xs font-mono rounded-lg border text-left transition-all ${
                    flexibility === 'Urgent'
                      ? 'bg-eco-amber/15 text-eco-amber-light border-eco-amber/50 shadow-neon-amber'
                      : 'bg-eco-surface text-slate-400 border-eco-border hover:bg-eco-card'
                  }`}
                >
                  <div className="font-bold">Urgent</div>
                  <div className="text-[10px] text-slate-400">Run immediately</div>
                </button>
              </div>
            </div>
          </div>

          {/* AI Decision Engine Simulated Outlook Banner */}
          <div className="p-4 rounded-xl bg-eco-surface/90 border border-eco-border flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${willExecuteImmediately ? 'bg-eco-neon/15 text-eco-neon' : 'bg-eco-amber/15 text-eco-amber'}`}>
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="text-xs font-mono">
                <span className="text-slate-400">Anticipated AI Decision: </span>
                <strong className={willExecuteImmediately ? 'text-eco-neon font-bold' : 'text-eco-amber-light font-bold'}>
                  {willExecuteImmediately ? 'EXECUTE NOW' : 'RESERVE JOB (HOLD UNTIL 12:30 PM)'}
                </strong>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                  {willExecuteImmediately
                    ? `Current renewable mix is ${currentRenewablePct}% (>= 75% threshold). Minimum carbon impact.`
                    : `Grid emission is ${currentCarbon} gCO₂/kWh. Delaying until solar peak will save approx ~${Math.round(energyReq * 0.28)} kg CO₂.`
                  }
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-eco-neon text-eco-darkest font-mono font-bold text-xs uppercase tracking-wider hover:bg-eco-neon/90 shadow-neon-green-sm active:scale-95 transition-all shrink-0 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Workload'}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: Data Table of Jobs Grouped by Status */}
      <div className="eco-glass-card rounded-2xl p-6">
        {/* Table Top Controls & Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-eco-cyan/15 text-eco-cyan border border-eco-cyan/30">
                <Layers className="h-4 w-4" />
              </span>
              <h3 className="font-semibold text-white text-lg tracking-wide">
                Workload Orchestration Table
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active, queued, and completed jobs tracked against real-time grid conditions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by job name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-eco-surface border border-eco-border rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-eco-cyan w-48 md:w-60 font-mono"
            />

            {/* Filter Tabs */}
            <div className="flex rounded-lg bg-eco-surface p-1 border border-eco-border text-xs font-mono">
              <button
                onClick={() => setActiveTabFilter('ALL')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTabFilter === 'ALL'
                    ? 'bg-eco-card text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({jobs.length})
              </button>
              <button
                onClick={() => setActiveTabFilter('Running')}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTabFilter === 'Running'
                    ? 'bg-emerald-950 text-eco-neon font-bold border border-eco-neon/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-eco-neon animate-pulse" />
                Running ({runningCount})
              </button>
              <button
                onClick={() => setActiveTabFilter('Pending')}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTabFilter === 'Pending'
                    ? 'bg-amber-950 text-eco-amber-light font-bold border border-eco-amber/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-eco-amber" />
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTabFilter('Completed')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTabFilter === 'Completed'
                    ? 'bg-cyan-950 text-eco-cyan font-bold border border-eco-cyan/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-eco-border">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-eco-surface border-b border-eco-border text-slate-400 uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 font-semibold">Job ID & Name</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Energy</th>
                <th className="py-3 px-4 font-semibold">Priority</th>
                <th className="py-3 px-4 font-semibold">Flexibility</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Execution / Window</th>
                <th className="py-3 px-4 font-semibold">Deadline</th>
                <th className="py-3 px-4 font-semibold text-right">CO₂ Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-eco-border/60 text-slate-300">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500 font-sans">
                    No matching workloads found in this view.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr 
                    key={job.id}
                    className="hover:bg-eco-card/60 transition-colors group"
                  >
                    {/* Job ID & Name */}
                    <td className="py-3 px-4 font-sans">
                      <div className="font-mono text-eco-cyan text-xs font-semibold">
                        {job.id}
                      </div>
                      <div className="text-white font-medium text-xs truncate max-w-xs" title={job.name}>
                        {job.name}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {job.nodesAllocated || 16} Nodes allocated
                      </span>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4 font-mono text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-eco-surface border border-eco-border/80 text-[11px]">
                        {job.type}
                      </span>
                    </td>

                    {/* Energy */}
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-white">{job.energyRequirement}</span>{' '}
                      <span className="text-slate-500">kWh</span>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4">
                      <PriorityBadge priority={job.priority} />
                    </td>

                    {/* Flexibility */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {job.flexibility === 'Urgent' ? (
                        <span className="text-eco-amber-light">⚡ Urgent</span>
                      ) : (
                        <span className="text-eco-neon">♻ Flexible</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={job.status} pulse={job.status === 'Running'} size="sm" />
                    </td>

                    {/* Execution Window */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {job.status === 'Running' ? (
                        <div>
                          <span className="text-eco-neon font-semibold">Active ({job.progress}%)</span>
                          <div className="w-20 bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                            <div 
                              className="bg-eco-neon h-full rounded-full transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      ) : job.status === 'Pending' ? (
                        <span className="text-eco-amber-light" title={job.reserveReason}>
                          {job.expectedExecutionTime || 'Waiting green window'}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          {formatDateTime(job.completedAt || job.executedAt)}
                        </span>
                      )}
                    </td>

                    {/* Deadline */}
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {formatDateTime(job.deadline)}
                    </td>

                    {/* CO2 Saved */}
                    <td className="py-3 px-4 font-mono text-right">
                      {job.carbonSavedKg ? (
                        <span className="text-eco-neon font-bold">
                          +{job.carbonSavedKg} <span className="text-[10px] text-slate-500 font-normal">kg</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">
                          Est. ~{Math.round(job.energyRequirement * 0.28)} kg
                        </span>
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
