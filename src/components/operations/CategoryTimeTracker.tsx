"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useMockQuery, useMockMutation } from '@/hooks/useMockConvex';
import { 
  PlayIcon, 
  StopIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { 
  STANDARD_CATEGORIES, 
  getCompanyCategories, 
  getCategoriesByGroup,
  calculateCategoryPpH,
  getProductivityInsights,
  type TimeCategory,
  type CategoryTimeSession
} from '@/utils/timeCategories';

export function CategoryTimeTracker() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [location, setLocation] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [customSOPs, setCustomSOPs] = useState<any[]>([]);
  
  // Try Convex first, fallback to mock data
  const convexSessions = useQuery(api.timeTracking?.listCategorySessions);
  const convexEmployees = useQuery(api.employees?.listActive);
  const convexStartSession = useMutation(api.timeTracking?.startCategorySession);
  const convexEndSession = useMutation(api.timeTracking?.endSession);
  
  const mockSessions = useMockQuery('timeTracking:listCategorySessions');
  const mockEmployees = useMockQuery('employees:listActive');
  const mockStartSession = useMockMutation('timeTracking:startCategorySession');
  const mockEndSession = useMockMutation('timeTracking:endSession');
  
  const sessions = convexSessions || mockSessions || mockCategoryTimeTrackingSessions;
  const employees = convexEmployees || mockEmployees || mockEmployeeData;
  const startSession = convexStartSession || mockStartSession;
  const endSession = convexEndSession || mockEndSession;

  // Get all categories (standard + custom SOPs)
  const allCategories = getCompanyCategories(customSOPs);
  const categoriesByGroup = getCategoriesByGroup(allCategories);

  // Active sessions
  const activeSessions = sessions.filter((s: CategoryTimeSession) => s.status === 'active');
  const currentUserActiveSession = activeSessions.find((s: CategoryTimeSession) => 
    s.employeeId === selectedEmployeeId
  );

  // Today's sessions for reporting
  const todaySessions = sessions.filter((s: CategoryTimeSession) => {
    const today = new Date();
    const sessionDate = new Date(s.startTime);
    return sessionDate.toDateString() === today.toDateString();
  });

  useEffect(() => {
    if (currentUserActiveSession) {
      setActiveSessionId(currentUserActiveSession._id);
    } else {
      setActiveSessionId(null);
    }
  }, [currentUserActiveSession]);

  const handleStartSession = async () => {
    if (!selectedEmployeeId || !selectedCategory) return;
    
    try {
      const category = allCategories.find(cat => cat.id === selectedCategory);
      await startSession({
        employeeId: selectedEmployeeId,
        category: selectedCategory,
        categoryName: category?.name || 'Unknown',
        workDescription: workDescription.trim() || undefined,
        location: location.trim() || undefined
      });
      
      // Reset form
      setWorkDescription('');
      setLocation('');
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await endSession({ sessionId });
      setActiveSessionId(null);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const formatDuration = (startTime: number, endTime?: number) => {
    const end = endTime || Date.now();
    const durationMs = end - startTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryButton = (category: TimeCategory, isSelected: boolean) => (
    <button
      key={category.id}
      onClick={() => setSelectedCategory(category.id)}
      className={`flex items-center space-x-2 p-3 rounded-lg border transition-all text-left ${
        isSelected 
          ? 'border-primary bg-primary/10 text-primary' 
          : 'border-border bg-card hover:bg-muted text-foreground'
      }`}
    >
      <span className="text-lg">{category.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{category.name}</div>
        <div className="text-xs text-muted-foreground truncate">{category.description}</div>
      </div>
      {category.isTreeWork && (
        <ChartBarIcon className="w-4 h-4 text-success" />
      )}
    </button>
  );

  // Calculate today's productivity insights
  const todayInsights = getProductivityInsights(todaySessions, allCategories);

  return (
    <div className="flex flex-col h-full">
      {/* Header with Quick Stats */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Category Time Tracker</h3>
            <p className="text-sm text-muted-foreground">Track time by specific business categories for accurate PpH calculations</p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-primary">{todayInsights.treeWorkHours.toFixed(1)}h</div>
              <div className="text-muted-foreground">Tree Work</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-warning">{todayInsights.supportHours.toFixed(1)}h</div>
              <div className="text-muted-foreground">Support</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-success">{activeSessions.length}</div>
              <div className="text-muted-foreground">Active</div>
            </div>
          </div>
        </div>

        {/* Employee Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Employee</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            >
              <option value="">Select Employee</option>
              {employees.map((employee: any) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} - {employee.position}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Job site address"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Work Description</label>
            <input
              type="text"
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              placeholder="Brief description"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Category Selection Buttons */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Tree Work Categories */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <WrenchScrewdriverIcon className="w-5 h-5 text-success" />
            <h4 className="font-medium text-foreground">Tree Work Categories</h4>
            <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">PpH Tracked</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoriesByGroup.treeWork.map(category => 
              getCategoryButton(category, selectedCategory === category.id)
            )}
          </div>
        </div>

        {/* Support Categories */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <TruckIcon className="w-5 h-5 text-warning" />
            <h4 className="font-medium text-foreground">Support Categories</h4>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Cost Tracking</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {categoriesByGroup.support.map(category => 
              getCategoryButton(category, selectedCategory === category.id)
            )}
          </div>
        </div>

        {/* Custom SOP Categories */}
        {categoriesByGroup.customSOPs.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <BuildingOfficeIcon className="w-5 h-5 text-info" />
              <h4 className="font-medium text-foreground">Company SOPs</h4>
              <span className="text-xs bg-info/10 text-info px-2 py-1 rounded-full">Custom</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoriesByGroup.customSOPs.map(category => 
                getCategoryButton(category, selectedCategory === category.id)
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
          {activeSessionId ? (
            <button
              onClick={() => handleEndSession(activeSessionId)}
              className="flex items-center space-x-2 bg-destructive text-destructive-foreground px-6 py-3 rounded-lg hover:bg-destructive/90 transition-colors"
            >
              <StopIcon className="w-5 h-5" />
              <span>End Current Session</span>
            </button>
          ) : (
            <button
              onClick={handleStartSession}
              disabled={!selectedEmployeeId || !selectedCategory}
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayIcon className="w-5 h-5" />
              <span>Start Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Sessions Panel */}
      {activeSessions.length > 0 && (
        <div className="bg-card border-t border-border p-4">
          <h4 className="font-medium text-foreground mb-3">Active Sessions ({activeSessions.length})</h4>
          
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {activeSessions.map((session: CategoryTimeSession) => {
              const employee = employees.find((e: any) => e._id === session.employeeId);
              const category = allCategories.find(cat => cat.id === session.category);
              return (
                <div key={session._id} className="bg-background border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{category?.icon}</span>
                      <span className="font-medium text-foreground text-sm">{employee?.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(session.startTime)}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-foreground">{session.categoryName}</div>
                    {session.location && (
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <MapPinIcon className="w-3 h-3" />
                        <span>{session.location}</span>
                      </div>
                    )}
                    {session.workDescription && (
                      <div className="text-xs text-muted-foreground">{session.workDescription}</div>
                    )}
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <ClockIcon className="w-3 h-3" />
                      <span>Started {formatTime(session.startTime)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleEndSession(session._id)}
                    className="w-full mt-2 bg-destructive/10 text-destructive px-2 py-1 rounded text-xs hover:bg-destructive/20 transition-colors"
                  >
                    End Session
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Mock data for development
const mockCategoryTimeTrackingSessions: CategoryTimeSession[] = [
  {
    _id: "session1",
    employeeId: "emp1",
    employeeName: "Sarah Johnson",
    category: "tree_removal",
    categoryName: "Tree Removal",
    sessionNumber: 1,
    startTime: Date.now() - 3600000, // 1 hour ago
    endTime: Date.now() - 1800000, // 30 minutes ago
    totalMinutes: 30,
    location: "123 Oak Street",
    workDescription: "Large oak removal with crane",
    treeScorePointsCompleted: 2500,
    treesCompleted: 1,
    equipmentUsed: ["crane", "chainsaw", "chipper"],
    projectPhase: "execution",
    status: "completed",
    isApproved: true,
    productivityRating: 9,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 1800000
  },
  {
    _id: "session2",
    employeeId: "emp2",
    employeeName: "Mike Thompson",
    category: "transport",
    categoryName: "Transport",
    sessionNumber: 1,
    startTime: Date.now() - 1800000, // 30 minutes ago
    totalMinutes: undefined, // Still active
    location: "En route to 456 Pine Ave",
    workDescription: "Driving to next job site",
    equipmentUsed: ["truck", "trailer"],
    projectPhase: "transport",
    status: "active",
    isApproved: false,
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now() - 1800000
  }
];

const mockEmployeeData = [
  {
    _id: "emp1",
    name: "Sarah Johnson",
    position: "ISA Arborist",
    skillLevel: "expert"
  },
  {
    _id: "emp2", 
    name: "Mike Thompson",
    position: "Crew Lead",
    skillLevel: "experienced"
  },
  {
    _id: "emp3",
    name: "David Wilson", 
    position: "Equipment Operator",
    skillLevel: "experienced"
  }
];