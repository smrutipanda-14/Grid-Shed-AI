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

export function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [gridMetrics, setGridMetrics] = useState(initialGridMetrics);
  const [timelineData, setTimelineData] = useState(initialTimelineData);
  const [jobs, setJobs] = useState(initialJobs);
  const [reserveQueue, setReserveQueue] = useState(initialReserveQueue);
  const [savingsData, setSavingsData] = useState(carbonSavingsSummary);
  
  // Re-evaluation countdown loop simulation (60s Celery task)
  const [lastReevaluationSeconds, setLastReevaluationSeconds] = useState(48);
  const [isSimulating, setIsSimulating] = useState(false);

  // Countdown timer for auto-reevaluation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setLastReevaluationSeconds((prev) => {
        if (prev <= 1) {
          return 60; // reset loop
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handler for adding a new job from Job Management Form
  const handleAddJob = (newJob) => {
    setJobs((prev) => [newJob, ...prev]);

    // If job was placed in Pending status, also place in Reserve Queue
    if (newJob.status === 'Pending') {
      const reserveItem = {
        id: `RES-${Math.floor(600 + Math.random() * 300)}`,
        name: newJob.name,
        type: newJob.type,
        priority: newJob.priority,
        reasonForReservation: newJob.reserveReason || 'Held for optimal green window',
        currentGridPct: gridMetrics.renewablePctTotal,
        requiredGridPct: 85,
        predictedExecutionTime: '12:30 PM (in 45m)',
        deadline: newJob.deadline,
        energyKWh: newJob.energyRequirement,
        estimatedAvoidedCO2Kg: Number((newJob.energyRequirement * 0.28).toFixed(1)),
      };
      setReserveQueue((prev) => [reserveItem, ...prev]);
    }
  };

  // Handler for manually overriding/forcing a reserved job to run
  const handleForceDispatch = (reservedJob) => {
    // Remove from reserve queue
    setReserveQueue((prev) => prev.filter((j) => j.id !== reservedJob.id));

    // Add or promote to running in jobs list
    const runningJob = {
      id: reservedJob.id.replace('RES-', 'JOB-'),
      name: reservedJob.name,
      type: reservedJob.type,
      energyRequirement: reservedJob.energyKWh || 600,
      priority: reservedJob.priority,
      deadline: reservedJob.deadline,
      flexibility: 'Urgent',
      status: 'Running',
      progress: 12,
      submittedAt: new Date().toISOString(),
      executedAt: new Date().toISOString(),
      expectedExecutionTime: 'Dispatched (Override)',
      nodesAllocated: 24,
    };
    setJobs((prev) => [runningJob, ...prev]);
  };

  // Handler for triggering green surge (simulates solar peak)
  const handleTriggerSurge = () => {
    setIsSimulating(true);
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
    }, 600);
  };

  // Handler for simulating grid fluctuation (e.g. cloud cover vs peak sun)
  const handleSimulateFluctuation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const isCurrentlyLow = gridMetrics.currentCarbonIntensity < 220;
      if (isCurrentlyLow) {
        // Transition to moderate afternoon cloud cover
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
        // Back to optimal green window
        setGridMetrics(initialGridMetrics);
      }
      setIsSimulating(false);
    }, 500);
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
