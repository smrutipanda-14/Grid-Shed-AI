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

  useEffect(() => {
    const timer = setInterval(() => {
      setLastReevaluationSeconds((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAddJob = (newJob) => {
    setJobs((prev) => [newJob, ...prev]);

    if (newJob.status === 'Pending') {
      const reserveItem = {
        id: `RES-${Math.floor(600 + Math.random() * 300)}`,
        name: newJob.name,
        type: newJob.type,
        priority: newJob.priority,
        reasonForReservation: newJob.reserveReason || 'Held for optimal green window',
        currentGridPct: gridMetrics.renewablePctTotal,
        requiredGridPct: 85,
        predictedExecutionTime: '11:45 AM (Green Window)',
        deadline: newJob.deadline,
        energyKWh: newJob.energyRequirement,
        estimatedAvoidedCO2Kg: Number((newJob.energyRequirement * 0.28).toFixed(1)),
      };
      setReserveQueue((prev) => [reserveItem, ...prev]);
    }
  };

  const handleForceDispatch = (reservedJob) => {
    setReserveQueue((prev) => prev.filter((j) => j.id !== reservedJob.id));

    const runningJob = {
      id: reservedJob.id.replace('RES-', 'JOB-'),
      name: reservedJob.name,
      type: reservedJob.type,
      energyRequirement: reservedJob.energyKWh || 600,
      priority: reservedJob.priority,
      deadline: reservedJob.deadline,
      flexibility: 'Urgent',
      status: 'Running',
      progress: 15,
      submittedAt: new Date().toISOString(),
      executedAt: new Date().toISOString(),
      expectedExecutionTime: 'Immediate (Override)',
      nodesAllocated: 24,
    };
    setJobs((prev) => [runningJob, ...prev]);
  };

  const handleSimulateFluctuation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const isCurrentlyLow = gridMetrics.currentCarbonIntensity < 220;
      if (isCurrentlyLow) {
        setGridMetrics((prev) => ({
          ...prev,
          currentCarbonIntensity: 310,
          carbonIntensityDelta: +14.2,
          gridFrequency: 49.98,
          gridStatus: 'Moderate',
          renewablePctTotal: 62,
          mix: [
            { name: 'Solar PV', value: 24, mw: 1027, color: '#00ff87', icon: 'Sun' },
            { name: 'Hydroelectric', value: 26, mw: 1112, color: '#00f0ff', icon: 'Droplets' },
            { name: 'Pumped Storage', value: 12, mw: 513, color: '#38bdf8', icon: 'BatteryCharging' },
            { name: 'Thermal (Coal/Gas)', value: 38, mw: 1626, color: '#f59e0b', icon: 'Flame' },
          ],
        }));
      } else {
        setGridMetrics(initialGridMetrics);
      }
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="flex min-h-screen bg-eco-darkest text-slate-100 font-sans selection:bg-eco-neon/20 selection:text-eco-neon">
      {/* Persistent Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        gridMetrics={gridMetrics}
        reserveCount={reserveQueue.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-60 min-w-0">
        {/* Header */}
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
