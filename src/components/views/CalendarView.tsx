"use client";

import { useState } from 'react';
import { SmartCalendar } from '@/components/calendar/SmartCalendar';
import { 
  CalendarIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CloudIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { AddressDisplay } from '@/components/ui/AddressDisplay';
import { calculateProjectDuration, checkWeatherImpact } from '@/utils/workflowAutomation';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'work_order' | 'proposal_followup' | 'maintenance' | 'blocked';
  startTime: Date;
  endTime: Date;
  duration: number;
  address: string;
  customerName: string;
  crewAssigned: string[];
  equipmentRequired: string[];
  complexity: 'low' | 'moderate' | 'high' | 'extreme';
  confidence: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'rescheduled';
  workOrderId?: string;
  proposalId?: string;
  notes?: string;
  weatherImpact?: WeatherImpact;
  treeScoreData?: Array<{
    height: number;
    canopyRadius: number;
    dbh: number;
    finalScore: number;
  }>;
}

export function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} minutes`;
    if (hours % 1 === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}min`;
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-success';
      case 'moderate': return 'text-warning';
      case 'high': return 'text-destructive';
      case 'extreme': return 'text-purple-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return CalendarIcon;
      case 'in_progress': return ClockIcon;
      case 'completed': return CheckCircleIcon;
      case 'rescheduled': return ExclamationTriangleIcon;
      default: return CalendarIcon;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Smart Calendar</h2>
            <p className="text-sm text-muted-foreground">
              AI-powered scheduling with accurate time predictions
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                viewMode === 'day' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                viewMode === 'week' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                viewMode === 'month' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-background rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-primary">8</div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </div>
          <div className="bg-background rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-success">92%</div>
            <div className="text-xs text-muted-foreground">Avg Confidence</div>
          </div>
          <div className="bg-background rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-warning">36h</div>
            <div className="text-xs text-muted-foreground">Total Hours</div>
          </div>
          <div className="bg-background rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-info">3</div>
            <div className="text-xs text-muted-foreground">ISA Required</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Calendar */}
        <div className="flex-1 overflow-y-auto">
          <SmartCalendar
            onDateSelect={handleDateSelect}
            onEventSelect={handleEventSelect}
            viewMode={viewMode}
            showTimeSlots={true}
          />
        </div>

        {/* Event Detail Sidebar */}
        {selectedEvent && (
          <div className="w-80 bg-card border-l border-border p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Event Header */}
              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {selectedEvent.title}
                </h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${selectedEvent.type === 'work_order' ? 'primary' : selectedEvent.type === 'maintenance' ? 'info' : 'warning'}/10 text-${selectedEvent.type === 'work_order' ? 'primary' : selectedEvent.type === 'maintenance' ? 'info' : 'warning'}`}>
                    {selectedEvent.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(selectedEvent.complexity)} bg-current/10`}>
                    {selectedEvent.complexity.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedEvent.customerName}
                </div>
              </div>

              {/* Timing */}
              <div>
                <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>Schedule</span>
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start:</span>
                    <span className="text-foreground">{formatTime(selectedEvent.startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End:</span>
                    <span className="text-foreground">{formatTime(selectedEvent.endTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="text-foreground">{formatDuration(selectedEvent.duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className={`font-medium ${
                      selectedEvent.confidence >= 90 ? 'text-success' :
                      selectedEvent.confidence >= 75 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {selectedEvent.confidence}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4" />
                  <span>Location</span>
                </h4>
                <AddressDisplay 
                  address={selectedEvent.address}
                  showLabel={false}
                  className="w-full"
                />
              </div>

              {/* Crew Assignment */}
              <div>
                <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
                  <UserGroupIcon className="w-4 h-4" />
                  <span>Crew ({selectedEvent.crewAssigned.length})</span>
                </h4>
                <div className="space-y-1">
                  {selectedEvent.crewAssigned.map((crew, index) => (
                    <div key={index} className="text-sm text-foreground bg-muted px-2 py-1 rounded">
                      {crew}
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
                  <WrenchScrewdriverIcon className="w-4 h-4" />
                  <span>Equipment ({selectedEvent.equipmentRequired.length})</span>
                </h4>
                <div className="space-y-1">
                  {selectedEvent.equipmentRequired.map((equipment, index) => (
                    <div key={index} className="text-sm text-foreground bg-muted px-2 py-1 rounded">
                      {equipment}
                    </div>
                  ))}
                </div>
              </div>

              {/* Weather Impact */}
              {selectedEvent.weatherImpact && (
                <div>
                  <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
                    <CloudIcon className="w-4 h-4" />
                    <span>Weather Impact</span>
                  </h4>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Condition:</span>
                        <span className="text-foreground capitalize">
                          {selectedEvent.weatherImpact.condition.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Impact:</span>
                        <span className={`font-medium ${
                          selectedEvent.weatherImpact.impact === 'none' ? 'text-success' :
                          selectedEvent.weatherImpact.impact === 'minor' ? 'text-warning' :
                          selectedEvent.weatherImpact.impact === 'major' ? 'text-destructive' :
                          'text-purple-500'
                        }`}>
                          {selectedEvent.weatherImpact.impact.toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {selectedEvent.weatherImpact.recommendation}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedEvent.notes && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Notes</h4>
                  <div className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
                    {selectedEvent.notes}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-border">
                <div className="space-y-2">
                  <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm">
                    View Work Order
                  </button>
                  <button className="w-full bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors text-sm">
                    Reschedule
                  </button>
                  <button className="w-full bg-warning/10 text-warning px-4 py-2 rounded-lg hover:bg-warning/20 transition-colors text-sm">
                    Notify Crew
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}