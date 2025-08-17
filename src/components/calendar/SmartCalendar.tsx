"use client";

import { useState, useMemo } from 'react';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import { 
  calculateProjectDuration, 
  findOptimalSchedulingSlot, 
  checkWeatherImpact,
  CalendarSlot,
  WeatherImpact 
} from '@/utils/workflowAutomation';

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
  confidence: number; // 0-100% timing confidence
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

interface SmartCalendarProps {
  onDateSelect?: (date: Date) => void;
  onEventSelect?: (event: CalendarEvent) => void;
  showTimeSlots?: boolean;
  viewMode?: 'month' | 'week' | 'day';
}

export function SmartCalendar({ 
  onDateSelect, 
  onEventSelect, 
  showTimeSlots = true,
  viewMode = 'week' 
}: SmartCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>(viewMode);

  // Mock calendar events with intelligent scheduling
  const events: CalendarEvent[] = useMemo(() => [
    {
      id: 'evt1',
      title: 'Oak Tree Removal - High Complexity',
      type: 'work_order',
      startTime: new Date(2025, 7, 18, 8, 0), // August 18, 8 AM
      endTime: new Date(2025, 7, 18, 16, 0), // 8 hours
      duration: 8,
      address: '123 Oak Street, Springfield, IL 62701',
      customerName: 'John Smith',
      crewAssigned: ['Sarah Johnson (ISA)', 'Mike Thompson', 'David Wilson'],
      equipmentRequired: ['Crane', 'Chipper', 'Chainsaw', 'Safety Equipment'],
      complexity: 'high',
      confidence: 85,
      status: 'scheduled',
      workOrderId: 'wo1',
      notes: 'Power line proximity - ISA Arborist required',
      weatherImpact: {
        date: new Date(2025, 7, 18),
        condition: 'partly_cloudy',
        impact: 'none',
        recommendation: 'Perfect conditions for tree removal'
      },
      treeScoreData: [
        { height: 60, canopyRadius: 25, dbh: 32, finalScore: 7875 }
      ]
    },
    {
      id: 'evt2',
      title: 'Maple Trimming - 3 Trees',
      type: 'work_order',
      startTime: new Date(2025, 7, 19, 9, 0),
      endTime: new Date(2025, 7, 19, 15, 0), // 6 hours
      duration: 6,
      address: '456 Pine Avenue, Springfield, IL 62702',
      customerName: 'Sarah Johnson',
      crewAssigned: ['Alex Rodriguez', 'John Martinez'],
      equipmentRequired: ['Bucket Truck', 'Chainsaw'],
      complexity: 'moderate',
      confidence: 92,
      status: 'scheduled',
      workOrderId: 'wo2',
      weatherImpact: {
        date: new Date(2025, 7, 19),
        condition: 'sunny',
        impact: 'none',
        recommendation: 'Excellent conditions'
      }
    },
    {
      id: 'evt3',
      title: 'Equipment Maintenance - Crane Service',
      type: 'maintenance',
      startTime: new Date(2025, 7, 20, 7, 0),
      endTime: new Date(2025, 7, 20, 11, 0), // 4 hours
      duration: 4,
      address: 'TreeAI Service Center',
      customerName: 'Internal',
      crewAssigned: ['Maintenance Team'],
      equipmentRequired: ['Crane'],
      complexity: 'low',
      confidence: 95,
      status: 'scheduled',
      notes: 'Scheduled 500-hour maintenance'
    },
    {
      id: 'evt4',
      title: 'WEATHER HOLD - Heavy Rain Expected',
      type: 'blocked',
      startTime: new Date(2025, 7, 21, 0, 0),
      endTime: new Date(2025, 7, 21, 23, 59),
      duration: 0,
      address: 'All Locations',
      customerName: 'Weather Block',
      crewAssigned: [],
      equipmentRequired: [],
      complexity: 'low',
      confidence: 80,
      status: 'scheduled',
      notes: 'Reschedule outdoor work due to storm',
      weatherImpact: {
        date: new Date(2025, 7, 21),
        condition: 'heavy_rain',
        impact: 'unsafe',
        recommendation: 'Cancel all tree removal operations'
      }
    }
  ], []);

  const getCalendarDays = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startOfCalendar = new Date(startOfMonth);
    startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay());
    
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startOfCalendar);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => 
      event.startTime.toDateString() === date.toDateString()
    );
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-success/10 text-success border-success/20';
      case 'moderate': return 'bg-warning/10 text-warning border-warning/20';
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'extreme': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'work_order': return WrenchScrewdriverIcon;
      case 'maintenance': return CheckCircleIcon;
      case 'blocked': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}min`;
    if (hours % 1 === 0) return `${hours}h`;
    return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}min`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    onEventSelect?.(event);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-foreground">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-xs text-muted-foreground">
            🎯 AI-Predicted Scheduling
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {getCalendarDays().map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === date.toDateString();

            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`min-h-[100px] p-1 border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors ${
                  isCurrentMonth ? 'bg-background' : 'bg-muted/20'
                } ${isToday ? 'ring-2 ring-primary' : ''} ${
                  isSelected ? 'bg-primary/10' : ''
                }`}
              >
                <div className={`text-sm mb-1 ${
                  isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                } ${isToday ? 'font-bold' : ''}`}>
                  {date.getDate()}
                </div>
                
                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => {
                    const TypeIcon = getTypeIcon(event.type);
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        className={`text-xs p-1 rounded border ${getComplexityColor(event.complexity)} hover:shadow-sm transition-shadow cursor-pointer`}
                      >
                        <div className="flex items-center space-x-1">
                          <TypeIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate font-medium">{event.title.split(' - ')[0]}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="flex items-center space-x-1">
                            <ClockIcon className="w-2 h-2" />
                            <span>{formatDuration(event.duration)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              event.confidence >= 90 ? 'bg-success' :
                              event.confidence >= 75 ? 'bg-warning' : 'bg-destructive'
                            }`} />
                            <span>{event.confidence}%</span>
                          </span>
                        </div>
                        {event.weatherImpact && event.weatherImpact.impact !== 'none' && (
                          <div className="flex items-center space-x-1 mt-1">
                            <CloudIcon className="w-2 h-2" />
                            <span className={`text-xs ${
                              event.weatherImpact.impact === 'unsafe' ? 'text-destructive' :
                              event.weatherImpact.impact === 'major' ? 'text-warning' : 'text-info'
                            }`}>
                              {event.weatherImpact.condition.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="border-t border-border p-4">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="font-medium text-foreground mb-2">Complexity Levels</div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success/20 border border-success/30 rounded"></div>
                <span className="text-muted-foreground">Low (1-2h)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-warning/20 border border-warning/30 rounded"></div>
                <span className="text-muted-foreground">Moderate (3-6h)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-destructive/20 border border-destructive/30 rounded"></div>
                <span className="text-muted-foreground">High (6-12h)</span>
              </div>
            </div>
          </div>
          <div>
            <div className="font-medium text-foreground mb-2">Confidence Level</div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-muted-foreground">90%+ High Confidence</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <span className="text-muted-foreground">75-89% Good Confidence</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-destructive rounded-full"></div>
                <span className="text-muted-foreground">&lt;75% Lower Confidence</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}