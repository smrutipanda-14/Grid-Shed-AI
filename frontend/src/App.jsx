import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { PageWrapper } from './components/layout/PageWrapper';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { JobManagementPage } from './pages/JobManagement/JobManagementPage';
import { ReserveQueuePage } from './pages/ReserveQueue/ReserveQueuePage';
import { CarbonSavingsPage } from './pages/CarbonSavings/CarbonSavingsPage';

import { 
  initialGridMetrics, 
  initialTimelineData, 
  initialJobs, 
  initialReserveQueue, 
  carbonSavingsSummary 
} from './data/mockData';

import { gridApi, jobsApi, analyticsApi } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [gridMetrics, setGridMetrics] = useState(initialGridMetrics);
  const [timelineData, setTimelineData] = useState(initialTimelineData);
  const [jobs, setJobs] = useState(initialJobs);
  const [reserveQueue, setReserveQueue] = useState(initialReserveQueue);
  const [savingsData, setSavingsData] = useState(carbonSavingsSummary);
  
  // Re-evaluation countdown loop simulation (30s / 60s Celery task)
  const [lastReevaluationSeconds, setLastReevaluationSeconds] = useState(30);
  const [isSimulating, setIsSimulating] = useState(false);

  // Countdown timer for auto-reevaluation loop visual indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setLastReevaluationSeconds((prev) => {
        if (prev <= 1) {
          return 30; // reset 30s Celery Beat loop
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 3-Second Live Polling Loop with safe fallback
  useEffect(() => {
    let isMounted = true;

    const pollLiveData = async () => {
      try {
        const [liveGrid, forecast, liveJobs, reserved, savings] = await Promise.all([
          gridApi.getLiveGrid(),
          gridApi.getForecast(),
          jobsApi.getJobs(),
          jobsApi.getReservedJobs(),
          analyticsApi.getSavings(),
        ]);

        if (isMounted) {
          if (liveGrid) setGridMetrics(liveGrid);
          if (forecast && Array.isArray(forecast) && forecast.length > 0) setTimelineData(forecast);
          if (liveJobs && Array.isArray(liveJobs) && liveJobs.length > 0) setJobs(liveJobs);
          if (reserved && Array.isArray(reserved)) setReserveQueue(reserved);
          if (savings) setSavingsData(savings);
        }
      } catch (err) {
        console.warn('[Polling] Background refresh fallback active:', err);
      }
    };

    pollLiveData(); // Initial poll
    const pollingInterval = setInterval(pollLiveData, 3000); // 3-second live polling

    return () => {
      isMounted = false;
      clearInterval(pollingInterval);
    };
  }, []);

  // Handler for adding a new job from Job Management Form
  const handleAddJob = async (newJobPayload) => {
    try {
      const created = await jobsApi.submitJob({
        name: newJobPayload.name,
        type: newJobPayload.type,
        energy_requirement: newJobPayload.energy_requirement || newJobPayload.energyRequirement,
        priority: newJobPayload.priority,
        deadline: newJobPayload.deadline,
        flexibility: newJobPayload.flexibility,
      });

      if (created) {
        setJobs((prev) => [created, ...prev.filter((j) => j.id !== created.id)]);
        if (created.status === 'Reserved' || created.status === 'Pending') {
          const reserveItem = {
            id: created.id,
            name: created.name,
            type: created.type,
            priority: created.priority,
            reasonForReservation: created.reserveReason || created.reserve_reason || 'Held for optimal green window',
            currentGridPct: gridMetrics.renewablePctTotal,
            requiredGridPct: created.required_renewable_pct || 65,
            predictedExecutionTime: created.expectedExecutionTime || '12:30 PM (in 45m)',
            deadline: created.deadline,
            energyKWh: created.energyRequirement || created.energy_requirement,
            estimatedAvoidedCO2Kg: Number(((created.energyRequirement || 450) * 0.28).toFixed(1)),
          };
          setReserveQueue((prev) => [reserveItem, ...prev.filter((j) => j.id !== reserveItem.id)]);
        }
        return created;
      }
    } catch (err) {
      console.warn('[SubmitJob] Backend offline, using local state fallback');
    }

    // Local Fallback if offline
    setJobs((prev) => [newJobPayload, ...prev]);
    if (newJobPayload.status === 'Pending' || newJobPayload.status === 'Reserved') {
      const reserveItem = {
        id: newJobPayload.id || `RES-${Math.floor(600 + Math.random() * 300)}`,
        name: newJobPayload.name,
        type: newJobPayload.type,
        priority: newJobPayload.priority,
        reasonForReservation: newJobPayload.reserveReason || 'Held for optimal green window',
        currentGridPct: gridMetrics.renewablePctTotal,
        requiredGridPct: 85,
        predictedExecutionTime: '12:30 PM (in 45m)',
        deadline: newJobPayload.deadline,
        energyKWh: newJobPayload.energyRequirement || 450,
        estimatedAvoidedCO2Kg: Number(((newJobPayload.energyRequirement || 450) * 0.28).toFixed(1)),
      };
      setReserveQueue((prev) => [reserveItem, ...prev]);
    }
    return newJobPayload;
  };

  // Handler for manually overriding/forcing a reserved job to run
  const handleForceDispatch = (reservedJob) => {
    // Remove from reserve queue
    setReserveQueue((prev) => prev.filter((j) => j.id !== reservedJob.id));

    // Add or promote to running in jobs list
    const runningJob = {
      id: reservedJob.id.startsWith('RES-') ? reservedJob.id.replace('RES-', 'JOB-') : reservedJob.id,
      name: reservedJob.name,
      type: reservedJob.type,
      energyRequirement: reservedJob.energyKWh || 600,
      priority: reservedJob.priority,
      deadline: reservedJob.deadline,
      flexibility: 'Urgent',
      status: 'Executing',
      progress: 12,
      submittedAt: new Date().toISOString(),
      executedAt: new Date().toISOString(),
      expectedExecutionTime: 'Dispatched (Override)',
      nodesAllocated: 24,
    };
    setJobs((prev) => [runningJob, ...prev]);
  };

  // Handler for triggering green surge (simulates solar peak)
  const handleTriggerSurge = async () => {
    setIsSimulating(true);
    try {
      const updated = await gridApi.simulateGrid('Optimal');
      if (updated) {
        setGridMetrics(updated);
        const [liveJobs, reserved] = await Promise.all([jobsApi.getJobs(), jobsApi.getReservedJobs()]);
        if (liveJobs) setJobs(liveJobs);
        if (reserved) setReserveQueue(reserved);
        setIsSimulating(false);
        return;
      }
    } catch (err) {
      console.warn('[Simulate] Backend offline, falling back to local simulation');
    }

    // Local Fallback simulation
    setTimeout(() => {
      setGridMetrics((prev) => ({
        ...prev,
        currentCarbonIntensity: 138,
        carbonIntensityDelta: -32.5,
        gridFrequency: 50.04,
        gridStatus: 'Optimal',
        renewablePctTotal: 92,
        mix: [
          { name: 'Solar PV', value: 48, mw: 2054, color: '#00ff87', icon: 'Sun' },
          { name: 'Hydroelectric', value: 34, mw: 1455, color: '#00f0ff', icon: 'Droplets' },
          { name: 'Pumped Storage', value: 10, mw: 428, color: '#38bdf8', icon: 'BatteryCharging' },
          { name: 'Thermal (Coal/Gas)', value: 8, mw: 342, color: '#f59e0b', icon: 'Flame' },
        ],
      }));
      setIsSimulating(false);
    }, 400);
  };

  // Handler for simulating grid fluctuation (e.g. cloud cover vs peak sun)
  const handleSimulateFluctuation = async () => {
    setIsSimulating(true);
    const isCurrentlyLow = (gridMetrics?.currentCarbonIntensity ?? 184) < 220;
    const targetScenario = isCurrentlyLow ? 'Moderate' : 'Optimal';

    try {
      const updated = await gridApi.simulateGrid(targetScenario);
      if (updated) {
        setGridMetrics(updated);
        const [liveJobs, reserved] = await Promise.all([jobsApi.getJobs(), jobsApi.getReservedJobs()]);
        if (liveJobs) setJobs(liveJobs);
        if (reserved) setReserveQueue(reserved);
        setIsSimulating(false);
        return;
      }
    } catch (err) {
      console.warn('[Simulate] Backend offline, falling back to local fluctuation');
    }

    // Local Fallback simulation
    setTimeout(() => {
      if (isCurrentlyLow) {
        setGridMetrics((prev) => ({
          ...prev,
          currentCarbonIntensity: 310,
          carbonIntensityDelta: +12.4,
          gridFrequency: 49.97,
          gridStatus: 'Moderate',
          renewablePctTotal: 58,
          mix: [
            { name: 'Solar PV', value: 20, mw: 856, color: '#00ff87', icon: 'Sun' },
            { name: 'Hydroelectric', value: 26, mw: 1112, color: '#00f0ff', icon: 'Droplets' },
            { name: 'Pumped Storage', value: 12, mw: 513, color: '#38bdf8', icon: 'BatteryCharging' },
            { name: 'Thermal (Coal/Gas)', value: 42, mw: 1797, color: '#f59e0b', icon: 'Flame' },
          ],
        }));
      } else {
        setGridMetrics(initialGridMetrics);
      }
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="flex min-h-screen bg-eco-darkest text-slate-100 font-sans selection:bg-eco-neon/30 selection:text-eco-neon">
      {/* Persistent Left Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        gridMetrics={gridMetrics} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-64 min-w-0">
        {/* Sticky Header with Live Status & Quick Actions */}
        <Header 
          currentTab={currentTab} 
          gridMetrics={gridMetrics} 
          onSimulateFluctuation={handleSimulateFluctuation}
          isSimulating={isSimulating}
          lastReevaluationSeconds={lastReevaluationSeconds}
        />

        {/* Page Content View */}
        <PageWrapper>
          {currentTab === 'dashboard' && (
            <DashboardPage 
              gridMetrics={gridMetrics} 
              timelineData={timelineData} 
              jobs={jobs}
              reserveQueue={reserveQueue}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'jobs' && (
            <JobManagementPage 
              jobs={jobs} 
              onAddJob={handleAddJob}
              gridMetrics={gridMetrics}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'reserve' && (
            <ReserveQueuePage 
              reserveQueue={reserveQueue} 
              onForceDispatch={handleForceDispatch}
              onTriggerSurge={handleTriggerSurge}
              gridMetrics={gridMetrics}
              lastReevaluationSeconds={lastReevaluationSeconds}
            />
          )}

          {currentTab === 'savings' && (
            <CarbonSavingsPage 
              savingsData={savingsData} 
            />
          )}
        </PageWrapper>
      </div>
    </div>
  );
}

export default App;
