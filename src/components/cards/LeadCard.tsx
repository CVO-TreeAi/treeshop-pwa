"use client";

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  CalendarIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

interface Lead {
  _id: string;
  customerName: string;
  phone?: string;
  email?: string;
  company?: string;
  propertyAddress: string;
  serviceType: string;
  urgencyLevel: string;
  leadSource: string;
  estimatedTreeCount: number;
  estimatedProjectValue: string;
  notes?: string;
  status: string;
  qualificationScore?: number;
  createdAt: number;
  followUpDate?: number;
  assignedTo?: string;
}

interface LeadCardProps {
  lead: Lead;
}

export function LeadCard({ lead }: LeadCardProps) {
  const [showActions, setShowActions] = useState(false);
  const updateLead = useMutation(api.leads.update);
  const convertToWorkOrder = useMutation(api.leads.convertToWorkOrder);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'qualified': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'proposal_sent': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400';
      case 'won': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'lost': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateLead({ id: lead._id, status: newStatus });
      setShowActions(false);
    } catch (error) {
      console.error('Failed to update lead status:', error);
    }
  };

  const handleConvertToWorkOrder = async () => {
    try {
      await convertToWorkOrder({
        leadId: lead._id,
        assignedCrew: [],
        requiredEquipment: []
      });
      setShowActions(false);
    } catch (error) {
      console.error('Failed to convert lead to work order:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg mb-1">{lead.customerName}</h3>
          {lead.company && (
            <p className="text-sm text-muted-foreground">{lead.company}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
            {lead.status.replace('_', ' ').toUpperCase()}
          </span>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <EllipsisVerticalIcon className="w-4 h-4 text-muted-foreground" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[150px]">
                <div className="py-1">
                  <button
                    onClick={() => handleStatusChange('contacted')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    Mark Contacted
                  </button>
                  <button
                    onClick={() => handleStatusChange('qualified')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    Mark Qualified
                  </button>
                  <button
                    onClick={handleConvertToWorkOrder}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors text-primary"
                  >
                    Convert to Work Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-3">
        {lead.phone && (
          <div className="flex items-center space-x-2">
            <PhoneIcon className="w-4 h-4 text-muted-foreground" />
            <a href={`tel:${lead.phone}`} className="text-sm text-primary hover:underline">
              {lead.phone}
            </a>
          </div>
        )}
        
        {lead.email && (
          <div className="flex items-center space-x-2">
            <EnvelopeIcon className="w-4 h-4 text-muted-foreground" />
            <a href={`mailto:${lead.email}`} className="text-sm text-primary hover:underline">
              {lead.email}
            </a>
          </div>
        )}
        
        <div className="flex items-start space-x-2">
          <MapPinIcon className="w-4 h-4 text-muted-foreground mt-0.5" />
          <span className="text-sm text-muted-foreground">{lead.propertyAddress}</span>
        </div>
      </div>

      {/* Service Details */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Service:</span>
          <span className="text-sm text-muted-foreground">{lead.serviceType}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Trees:</span>
          <span className="text-sm text-muted-foreground">{lead.estimatedTreeCount}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Est. Value:</span>
          <span className="text-sm text-muted-foreground">{lead.estimatedProjectValue}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Urgency:</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(lead.urgencyLevel)}`}>
            {lead.urgencyLevel.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Notes */}
      {lead.notes && (
        <div className="mb-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Notes:</span> {lead.notes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
        <div className="flex items-center space-x-1">
          <CalendarIcon className="w-3 h-3" />
          <span>Created {formatDate(lead.createdAt)}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span>Source: {lead.leadSource}</span>
          {lead.qualificationScore && (
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Score: {lead.qualificationScore}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}