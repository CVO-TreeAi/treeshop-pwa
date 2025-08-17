"use client";

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useMockQuery } from '@/hooks/useMockConvex';
import { 
  UserGroupIcon, 
  WrenchScrewdriverIcon, 
  ClockIcon,
  CubeIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { EmployeeDirectory } from '@/components/operations/EmployeeDirectory';
import { EquipmentManagement } from '@/components/operations/EquipmentManagement';
import { CategoryTimeTracker } from '@/components/operations/CategoryTimeTracker';
import { LoadoutManager } from '@/components/operations/LoadoutManager';

type OperationsTab = 'employees' | 'equipment' | 'timetracker' | 'loadouts';

export function OperationsView() {
  const [activeTab, setActiveTab] = useState<OperationsTab>('employees');

  // Try Convex first, fallback to mock data
  const convexEmployees = useQuery(api.employees.listActive);
  const convexEquipment = useQuery(api.equipment.listAvailable);
  const convexTimeSessions = useQuery(api.timeTracking.listSessions);
  
  const mockEmployees = useMockQuery('employees:listActive');
  const mockEquipment = useMockQuery('equipment:listAvailable');
  const mockTimeSessions = useMockQuery('timeTracking:listSessions');
  
  const employees = convexEmployees || mockEmployees || [];
  const equipment = convexEquipment || mockEquipment || [];
  const timeSessions = convexTimeSessions || mockTimeSessions || [];

  const tabs = [
    {
      id: 'employees' as OperationsTab,
      name: 'Employee Directory',
      icon: UserGroupIcon,
      description: 'Manage crew members, certifications, and availability',
      count: employees.length
    },
    {
      id: 'equipment' as OperationsTab,
      name: 'Equipment',
      icon: WrenchScrewdriverIcon,
      description: 'Track equipment, maintenance, and utilization',
      count: equipment.length
    },
    {
      id: 'timetracker' as OperationsTab,
      name: 'Time Tracker',
      icon: ClockIcon,
      description: 'Session-based time tracking and productivity',
      count: timeSessions.filter((s: any) => s.status === 'active').length
    },
    {
      id: 'loadouts' as OperationsTab,
      name: 'Loadouts',
      icon: CubeIcon,
      description: 'Equipment combinations for different job types',
      count: 0
    }
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Operations Center</h2>
            <p className="text-sm text-muted-foreground">Complete tree service operations management</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{employees.length}</div>
              <div className="text-xs text-muted-foreground">Active Crew</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{equipment.length}</div>
              <div className="text-xs text-muted-foreground">Equipment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{timeSessions.filter((s: any) => s.status === 'active').length}</div>
              <div className="text-xs text-muted-foreground">Active Sessions</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'employees' && <EmployeeDirectory />}
        {activeTab === 'equipment' && <EquipmentManagement />}
        {activeTab === 'timetracker' && <CategoryTimeTracker />}
        {activeTab === 'loadouts' && <LoadoutManager />}
      </div>
    </div>
  );
}