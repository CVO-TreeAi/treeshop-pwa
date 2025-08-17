/**
 * TreeAI Workflow Automation Engine
 * Automatically progresses projects through stages based on completion triggers
 */

export interface WorkflowStage {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  estimatedDuration: number; // hours
  dependencies: string[]; // stage IDs that must complete first
  triggers: WorkflowTrigger[];
  automations: WorkflowAutomation[];
}

export interface WorkflowTrigger {
  type: 'time_completion' | 'status_change' | 'user_action' | 'ai_assessment' | 'photo_upload';
  condition: string;
  action: string;
}

export interface WorkflowAutomation {
  action: 'advance_stage' | 'create_invoice' | 'send_notification' | 'schedule_followup' | 'update_calendar';
  parameters: Record<string, any>;
  delay?: number; // minutes to delay execution
}

// Standard TreeAI Business Workflow
export const TREE_SERVICE_WORKFLOW: WorkflowStage[] = [
  {
    id: 'lead_qualification',
    name: 'Lead Qualification',
    status: 'pending',
    estimatedDuration: 0.5, // 30 minutes
    dependencies: [],
    triggers: [
      {
        type: 'user_action',
        condition: 'qualification_score >= 7',
        action: 'advance_to_proposal'
      }
    ],
    automations: [
      {
        action: 'advance_stage',
        parameters: { next_stage: 'proposal_creation' }
      }
    ]
  },
  {
    id: 'proposal_creation',
    name: 'Proposal Creation',
    status: 'pending',
    estimatedDuration: 1, // 1 hour
    dependencies: ['lead_qualification'],
    triggers: [
      {
        type: 'ai_assessment',
        condition: 'alex_assessment_complete',
        action: 'auto_generate_proposal'
      }
    ],
    automations: [
      {
        action: 'advance_stage',
        parameters: { next_stage: 'proposal_review' }
      }
    ]
  },
  {
    id: 'proposal_review',
    name: 'Proposal Review & Send',
    status: 'pending',
    estimatedDuration: 0.25, // 15 minutes
    dependencies: ['proposal_creation'],
    triggers: [
      {
        type: 'user_action',
        condition: 'proposal_sent',
        action: 'start_customer_review_timer'
      }
    ],
    automations: [
      {
        action: 'send_notification',
        parameters: { type: 'proposal_sent', recipient: 'customer' }
      },
      {
        action: 'schedule_followup',
        parameters: { days: 3, action: 'proposal_followup' }
      }
    ]
  },
  {
    id: 'customer_approval',
    name: 'Customer Approval',
    status: 'pending',
    estimatedDuration: 72, // 3 days average
    dependencies: ['proposal_review'],
    triggers: [
      {
        type: 'status_change',
        condition: 'proposal_approved',
        action: 'create_work_order'
      }
    ],
    automations: [
      {
        action: 'advance_stage',
        parameters: { next_stage: 'work_scheduling' }
      },
      {
        action: 'update_calendar',
        parameters: { action: 'schedule_project' }
      }
    ]
  },
  {
    id: 'work_scheduling',
    name: 'Work Scheduling',
    status: 'pending',
    estimatedDuration: 0.5, // 30 minutes
    dependencies: ['customer_approval'],
    triggers: [
      {
        type: 'user_action',
        condition: 'crew_assigned_and_scheduled',
        action: 'send_crew_notifications'
      }
    ],
    automations: [
      {
        action: 'send_notification',
        parameters: { type: 'work_scheduled', recipient: 'crew' }
      },
      {
        action: 'send_notification',
        parameters: { type: 'work_scheduled', recipient: 'customer' }
      }
    ]
  },
  {
    id: 'work_execution',
    name: 'Work Execution',
    status: 'pending',
    estimatedDuration: 0, // Calculated from TreeScore and complexity
    dependencies: ['work_scheduling'],
    triggers: [
      {
        type: 'time_completion',
        condition: 'session_ended',
        action: 'check_work_completion'
      },
      {
        type: 'photo_upload',
        condition: 'after_photos_uploaded',
        action: 'trigger_completion_check'
      }
    ],
    automations: [
      {
        action: 'advance_stage',
        parameters: { next_stage: 'quality_review' }
      }
    ]
  },
  {
    id: 'quality_review',
    name: 'Quality Review & Cleanup',
    status: 'pending',
    estimatedDuration: 0.5, // 30 minutes
    dependencies: ['work_execution'],
    triggers: [
      {
        type: 'user_action',
        condition: 'quality_approved',
        action: 'proceed_to_invoicing'
      }
    ],
    automations: [
      {
        action: 'advance_stage',
        parameters: { next_stage: 'invoicing' }
      }
    ]
  },
  {
    id: 'invoicing',
    name: 'Invoice Generation',
    status: 'pending',
    estimatedDuration: 0.25, // 15 minutes
    dependencies: ['quality_review'],
    triggers: [
      {
        type: 'status_change',
        condition: 'work_order_completed',
        action: 'auto_generate_invoice'
      }
    ],
    automations: [
      {
        action: 'create_invoice',
        parameters: { based_on: 'work_order_actuals' }
      },
      {
        action: 'send_notification',
        parameters: { type: 'invoice_sent', recipient: 'customer' }
      }
    ]
  }
];

/**
 * Calculate estimated project duration based on TreeScore and complexity
 */
export function calculateProjectDuration(
  treeScoreData: any[],
  complexity: string,
  equipmentRequired: string[]
): number {
  const baseHours = treeScoreData.reduce((total, tree) => {
    const treeHours = (tree.height * tree.canopyRadius) / 400; // Base formula
    return total + treeHours;
  }, 0);

  const complexityMultipliers = {
    low: 1.2,
    moderate: 1.5,
    high: 2.1,
    extreme: 2.8
  };

  const equipmentSetupTime = equipmentRequired.includes('Crane') ? 1.5 : 0.5;
  const complexityMultiplier = complexityMultipliers[complexity as keyof typeof complexityMultipliers] || 1.5;

  return Math.ceil((baseHours * complexityMultiplier) + equipmentSetupTime);
}

/**
 * Intelligent Calendar Scheduling
 */
export interface CalendarSlot {
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  crewId: string;
  equipmentIds: string[];
  confidence: number; // 0-100% confidence in timing accuracy
}

export function findOptimalSchedulingSlot(
  requiredDuration: number,
  requiredCrew: string[],
  requiredEquipment: string[],
  preferredDate?: Date,
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency' = 'medium'
): CalendarSlot[] {
  // This would integrate with actual calendar data
  // For now, return smart predictions based on duration and complexity
  
  const slots: CalendarSlot[] = [];
  const startDate = preferredDate || new Date();
  
  // Urgency affects scheduling priority
  const daysOut = urgencyLevel === 'emergency' ? 0 : urgencyLevel === 'high' ? 1 : 3;
  
  for (let i = daysOut; i < daysOut + 14; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Skip weekends for non-emergency work
    if (urgencyLevel !== 'emergency' && (date.getDay() === 0 || date.getDay() === 6)) {
      continue;
    }
    
    slots.push({
      date,
      startTime: urgencyLevel === 'emergency' ? 'ASAP' : '08:00',
      endTime: urgencyLevel === 'emergency' ? 'Until Complete' : calculateEndTime(requiredDuration),
      duration: requiredDuration,
      crewId: requiredCrew[0] || 'auto_assign',
      equipmentIds: requiredEquipment,
      confidence: calculateSchedulingConfidence(requiredDuration, requiredEquipment, urgencyLevel)
    });
  }
  
  return slots.sort((a, b) => b.confidence - a.confidence);
}

function calculateEndTime(duration: number): string {
  const startHour = 8; // 8 AM start
  const endHour = startHour + Math.ceil(duration);
  return `${endHour.toString().padStart(2, '0')}:00`;
}

function calculateSchedulingConfidence(
  duration: number,
  equipment: string[],
  urgency: string
): number {
  let confidence = 85; // Base confidence
  
  // Reduce confidence for complex equipment setups
  if (equipment.includes('Crane')) confidence -= 15;
  if (equipment.includes('Stump Grinder')) confidence -= 5;
  
  // Reduce confidence for very long jobs
  if (duration > 8) confidence -= 10;
  if (duration > 12) confidence -= 20;
  
  // Emergency work has lower confidence due to unknowns
  if (urgency === 'emergency') confidence -= 25;
  
  return Math.max(confidence, 60);
}

/**
 * GPS-Friendly Address Formatting
 */
export function formatAddressForGPS(address: string): {
  formatted: string;
  googleMapsUrl: string;
  appleMapsUrl: string;
  wazeUrl: string;
} {
  const cleanAddress = address.trim().replace(/\s+/g, ' ');
  const encodedAddress = encodeURIComponent(cleanAddress);
  
  return {
    formatted: cleanAddress,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
    appleMapsUrl: `http://maps.apple.com/?q=${encodedAddress}`,
    wazeUrl: `https://waze.com/ul?q=${encodedAddress}&navigate=yes`
  };
}

/**
 * Workflow Stage Progression Engine
 */
export class WorkflowEngine {
  static async checkStageCompletion(
    workOrderId: string,
    currentStage: string,
    triggerType: string,
    triggerData: any
  ): Promise<{ shouldAdvance: boolean; nextStage?: string; automations: WorkflowAutomation[] }> {
    const workflow = TREE_SERVICE_WORKFLOW.find(stage => stage.id === currentStage);
    if (!workflow) {
      return { shouldAdvance: false, automations: [] };
    }

    // Check if any triggers are satisfied
    for (const trigger of workflow.triggers) {
      if (trigger.type === triggerType && this.evaluateTriggerCondition(trigger.condition, triggerData)) {
        const nextStageIndex = TREE_SERVICE_WORKFLOW.findIndex(s => s.id === currentStage) + 1;
        const nextStage = TREE_SERVICE_WORKFLOW[nextStageIndex];
        
        return {
          shouldAdvance: true,
          nextStage: nextStage?.id,
          automations: workflow.automations
        };
      }
    }

    return { shouldAdvance: false, automations: [] };
  }

  private static evaluateTriggerCondition(condition: string, data: any): boolean {
    // Simple condition evaluation - could be expanded with a proper expression parser
    switch (condition) {
      case 'qualification_score >= 7':
        return data.qualificationScore >= 7;
      case 'alex_assessment_complete':
        return data.assessmentStatus === 'completed';
      case 'proposal_sent':
        return data.status === 'sent';
      case 'proposal_approved':
        return data.status === 'approved';
      case 'crew_assigned_and_scheduled':
        return data.crewAssigned && data.scheduledDate;
      case 'session_ended':
        return data.sessionStatus === 'completed';
      case 'after_photos_uploaded':
        return data.afterPhotos && data.afterPhotos.length > 0;
      case 'quality_approved':
        return data.qualityCheck === 'approved';
      case 'work_order_completed':
        return data.status === 'completed';
      default:
        return false;
    }
  }

  static async executeAutomations(automations: WorkflowAutomation[], context: any): Promise<void> {
    for (const automation of automations) {
      // Add delay if specified
      if (automation.delay) {
        await new Promise(resolve => setTimeout(resolve, automation.delay * 60000));
      }

      switch (automation.action) {
        case 'advance_stage':
          console.log(`Advancing to stage: ${automation.parameters.next_stage}`);
          // Update work order stage
          break;
        case 'create_invoice':
          console.log('Auto-creating invoice based on work order actuals');
          // Trigger invoice creation
          break;
        case 'send_notification':
          console.log(`Sending ${automation.parameters.type} notification to ${automation.parameters.recipient}`);
          // Send notification (email/SMS)
          break;
        case 'schedule_followup':
          console.log(`Scheduling followup in ${automation.parameters.days} days`);
          // Add to calendar/reminder system
          break;
        case 'update_calendar':
          console.log('Updating calendar with project schedule');
          // Update calendar system
          break;
      }
    }
  }
}

/**
 * Weather Integration for Scheduling
 */
export interface WeatherImpact {
  date: Date;
  condition: string;
  impact: 'none' | 'minor' | 'major' | 'unsafe';
  recommendation: string;
}

export function checkWeatherImpact(
  scheduledDate: Date,
  serviceType: string
): WeatherImpact {
  // This would integrate with real weather API
  // For now, return mock data with intelligent recommendations
  
  const weatherConditions = ['sunny', 'cloudy', 'light_rain', 'heavy_rain', 'wind', 'storm'];
  const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
  
  let impact: WeatherImpact['impact'] = 'none';
  let recommendation = 'Proceed as scheduled';
  
  if (serviceType.includes('removal') || serviceType.includes('crane')) {
    switch (condition) {
      case 'heavy_rain':
      case 'storm':
        impact = 'unsafe';
        recommendation = 'Reschedule - unsafe conditions for tree removal';
        break;
      case 'wind':
        impact = 'major';
        recommendation = 'Monitor wind speeds - may need to reschedule';
        break;
      case 'light_rain':
        impact = 'minor';
        recommendation = 'Proceed with caution - ensure safety protocols';
        break;
    }
  }
  
  return {
    date: scheduledDate,
    condition,
    impact,
    recommendation
  };
}