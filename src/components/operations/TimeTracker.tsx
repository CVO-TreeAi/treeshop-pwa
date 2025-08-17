"use client";

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useMockQuery, useMockMutation } from '@/hooks/useMockConvex';
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface TimeSession {
  _id: string;
  employeeId: string;
  workOrderId?: string;
  sessionNumber: number;
  startTime: number;
  endTime?: number;
  totalMinutes?: number;
  sessionType: string;
  location?: string;
  workDescription?: string;
  status: string;
  isApproved: boolean;
  createdAt: number;
}

export function TimeTracker() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [workDescription, setWorkDescription] = useState('');
  const [location, setLocation] = useState('');
  const [sessionType, setSessionType] = useState<'work' | 'break' | 'lunch' | 'travel'>('work');
  
  // Try Convex first, fallback to mock data
  const convexSessions = useQuery(api.timeTracking.listSessions);
  const convexEmployees = useQuery(api.employees.listActive);
  const convexStartSession = useMutation(api.timeTracking.startSession);
  const convexEndSession = useMutation(api.timeTracking.endSession);
  
  const mockSessions = useMockQuery('timeTracking:listSessions');
  const mockEmployees = useMockQuery('employees:listActive');
  const mockStartSession = useMockMutation('timeTracking:startSession');
  const mockEndSession = useMockMutation('timeTracking:endSession');
  
  const sessions = convexSessions || mockSessions || mockTimeTrackingSessions;
  const employees = convexEmployees || mockEmployees || mockEmployeeData;
  const startSession = convexStartSession || mockStartSession;
  const endSession = convexEndSession || mockEndSession;

  const activeSessions = sessions.filter((s: TimeSession) => s.status === 'active');
  const todaySessions = sessions.filter((s: TimeSession) => {
    const today = new Date();
    const sessionDate = new Date(s.startTime);
    return sessionDate.toDateString() === today.toDateString();
  });

  const handleStartSession = async () => {
    if (!selectedEmployeeId) return;
    
    try {
      await startSession({
        employeeId: selectedEmployeeId,
        sessionType,
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

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'work': return 'bg-primary/10 text-primary';
      case 'break': return 'bg-warning/10 text-warning';
      case 'lunch': return 'bg-secondary/10 text-secondary-foreground';
      case 'travel': return 'bg-info/10 text-info';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Start Session Panel */}
      <div className="bg-card border-b border-border p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Start New Session</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <label className="block text-sm font-medium text-foreground mb-2">Session Type</label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as any)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            >
              <option value="work">Work</option>
              <option value="break">Break</option>
              <option value="lunch">Lunch</option>
              <option value="travel">Travel</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Job site address or description"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Work Description</label>
            <input
              type="text"
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              placeholder="Brief description of work"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={handleStartSession}
            disabled={!selectedEmployeeId}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayIcon className="w-4 h-4" />
            <span>Start Session</span>
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="bg-card border-b border-border p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Active Sessions ({activeSessions.length})</h3>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeSessions.map((session: TimeSession) => {
              const employee = employees.find((e: any) => e._id === session.employeeId);
              return (
                <div key={session._id} className="bg-background border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{employee?.name || 'Unknown'}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionTypeColor(session.sessionType)}`}>
                      {session.sessionType}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-3 h-3" />
                      <span>Started: {formatTime(session.startTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-3 h-3" />
                      <span>Duration: {formatDuration(session.startTime)}</span>
                    </div>
                    {session.location && (
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="w-3 h-3" />
                        <span className="truncate">{session.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {session.workDescription && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {session.workDescription}
                    </p>
                  )}
                  
                  <button
                    onClick={() => handleEndSession(session._id)}
                    className="flex items-center space-x-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-lg hover:bg-destructive/90 transition-colors text-sm"
                  >
                    <StopIcon className="w-3 h-3" />
                    <span>End Session</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Today's Sessions */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Today's Sessions ({todaySessions.length})</h3>
        
        {todaySessions.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground mb-4">No sessions tracked today</div>
            <p className="text-sm text-muted-foreground">Start tracking time to see session history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaySessions
              .sort((a, b) => b.startTime - a.startTime)
              .map((session: TimeSession) => {
                const employee = employees.find((e: any) => e._id === session.employeeId);
                return (
                  <div key={session._id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{employee?.name || 'Unknown'}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionTypeColor(session.sessionType)}`}>
                          {session.sessionType}
                        </span>
                        {session.isApproved && (
                          <span className="px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                            Approved
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">
                          {session.endTime ? formatDuration(session.startTime, session.endTime) : 'Active'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(session.startTime)} - {session.endTime ? formatTime(session.endTime) : 'Now'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {session.location && (
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <MapPinIcon className="w-3 h-3" />
                          <span className="truncate">{session.location}</span>
                        </div>
                      )}
                      {session.workDescription && (
                        <div className="text-muted-foreground">
                          <span className="font-medium">Work: </span>
                          {session.workDescription}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

// Mock data for development
const mockTimeTrackingSessions = [
  {
    _id: "session1",
    employeeId: "emp1",
    sessionNumber: 1,
    startTime: Date.now() - 3600000, // 1 hour ago
    endTime: Date.now() - 1800000, // 30 minutes ago
    totalMinutes: 30,
    sessionType: "work",
    location: "5785 Blue Ridge Court, Keystone Heights, FL",
    workDescription: "CAT 265 Skid Steer + Fecon Blackhawk Mulcher - 0.71 acres forestry mulching",
    status: "completed",
    isApproved: true,
    createdAt: Date.now() - 3600000
  },
  {
    _id: "session2", 
    employeeId: "emp1",
    sessionNumber: 2,
    startTime: Date.now() - 1200000, // 20 minutes ago
    sessionType: "lunch",
    location: "5785 Blue Ridge Court, Keystone Heights, FL",
    status: "active",
    isApproved: false,
    createdAt: Date.now() - 1200000
  }
];

const mockEmployeeData = [
  {
    _id: "emp1",
    name: "John Martinez",
    position: "Equipment Operator",
    certifications: ["CDL Class A", "Heavy Equipment"],
    isActive: true
  },
  {
    _id: "emp2", 
    name: "Sarah Johnson",
    position: "ISA Certified Arborist",
    certifications: ["ISA Certified Arborist", "Crane Operator"],
    isActive: true
  }
];