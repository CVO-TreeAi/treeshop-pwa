"use client";

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useMockMutation } from '@/hooks/useMockConvex';
import { 
  XMarkIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { PhotoUpload } from '@/components/ui/PhotoUpload';
import { PhotoGallery } from '@/components/ui/PhotoGallery';

interface WorkOrder {
  _id: string;
  workOrderNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  propertyAddress: string;
  serviceType: string;
  jobDescription: string;
  scheduledDate?: number;
  estimatedDuration?: number;
  actualStartTime?: number;
  actualEndTime?: number;
  assignedCrew: string[];
  requiredEquipment: string[];
  crewLeadId?: string;
  estimatedCost: number;
  actualCost?: number;
  laborHours?: number;
  materialCosts?: number;
  equipmentCosts?: number;
  status: string;
  priority: string;
  completionNotes?: string;
  customerSignature?: string;
  photos?: string[];
  createdAt: number;
  isActive: boolean;
}

interface WorkOrderDetailModalProps {
  workOrder: WorkOrder;
  onClose: () => void;
  onUpdate?: () => void;
}

export function WorkOrderDetailModal({ workOrder, onClose, onUpdate }: WorkOrderDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'photos' | 'completion'>('details');
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionData, setCompletionData] = useState({
    completionNotes: '',
    actualCost: workOrder.actualCost || 0,
    laborHours: workOrder.laborHours || 0,
    materialCosts: workOrder.materialCosts || 0,
    equipmentCosts: workOrder.equipmentCosts || 0,
  });

  // Try Convex first, fallback to mock mutations
  const convexStartWork = useMutation(api.workOrders.startWork);
  const convexCompleteWork = useMutation(api.workOrders.completeWork);
  
  const startWork = convexStartWork || useMockMutation('workOrders:startWork');
  const completeWork = convexCompleteWork || useMockMutation('workOrders:completeWork');

  const handleStartWork = async () => {
    setIsStarting(true);
    try {
      await startWork({ id: workOrder._id });
      onUpdate?.();
    } catch (error) {
      console.error('Failed to start work:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteWork = async () => {
    setIsCompleting(true);
    try {
      await completeWork({
        id: workOrder._id,
        ...completionData
      });
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to complete work:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success';
      case 'in_progress': return 'bg-warning/10 text-warning';
      case 'scheduled': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const canStart = workOrder.status === 'scheduled' || workOrder.status === 'pending';
  const canComplete = workOrder.status === 'in_progress';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              {workOrder.workOrderNumber}
            </h2>
            <p className="text-sm text-muted-foreground">
              {workOrder.customerName} • {workOrder.serviceType}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(workOrder.status)}`}>
              {workOrder.status.replace('_', ' ').toUpperCase()}
            </span>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { id: 'details', name: 'Details', icon: ClockIcon },
            { id: 'photos', name: 'Photos', icon: PhotoIcon },
            { id: 'completion', name: 'Completion', icon: CheckCircleIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Work Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Job Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-foreground">Customer:</span>
                      <p className="text-sm text-muted-foreground">{workOrder.customerName}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-foreground">Address:</span>
                      <p className="text-sm text-muted-foreground">{workOrder.propertyAddress}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-foreground">Service:</span>
                      <p className="text-sm text-muted-foreground">{workOrder.serviceType}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-foreground">Description:</span>
                      <p className="text-sm text-muted-foreground">{workOrder.jobDescription}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Scheduling</h3>
                  <div className="space-y-3">
                    {workOrder.scheduledDate && (
                      <div>
                        <span className="text-sm font-medium text-foreground">Scheduled:</span>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(workOrder.scheduledDate)}
                        </p>
                      </div>
                    )}
                    
                    {workOrder.actualStartTime && (
                      <div>
                        <span className="text-sm font-medium text-foreground">Started:</span>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(workOrder.actualStartTime)}
                        </p>
                      </div>
                    )}
                    
                    {workOrder.actualEndTime && (
                      <div>
                        <span className="text-sm font-medium text-foreground">Completed:</span>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(workOrder.actualEndTime)}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-sm font-medium text-foreground">Estimated Cost:</span>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(workOrder.estimatedCost)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-border">
                {canStart && (
                  <button
                    onClick={handleStartWork}
                    disabled={isStarting}
                    className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <PlayIcon className="w-4 h-4" />
                    <span>{isStarting ? 'Starting...' : 'Start Work'}</span>
                  </button>
                )}
                
                {canComplete && (
                  <button
                    onClick={() => setActiveTab('completion')}
                    className="flex items-center space-x-2 bg-success text-white px-4 py-2 rounded-lg hover:bg-success/90 transition-colors"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Complete Work</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Work Order Photos</h3>
              
              {/* Photo Upload Component */}
              <PhotoUpload
                entityType="work_order"
                entityId={workOrder._id}
                allowCategories={['before', 'during', 'after', 'damage', 'equipment']}
                maxPhotos={20}
                allowMultiple={true}
              />
            </div>
          )}

          {activeTab === 'completion' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Complete Work Order</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Completion Notes
                  </label>
                  <textarea
                    value={completionData.completionNotes}
                    onChange={(e) => setCompletionData({ ...completionData, completionNotes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
                    placeholder="Enter completion notes, observations, or issues..."
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Actual Cost ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={completionData.actualCost}
                      onChange={(e) => setCompletionData({ ...completionData, actualCost: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Labor Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={completionData.laborHours}
                      onChange={(e) => setCompletionData({ ...completionData, laborHours: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Material Costs ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={completionData.materialCosts}
                        onChange={(e) => setCompletionData({ ...completionData, materialCosts: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Equipment Costs ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={completionData.equipmentCosts}
                        onChange={(e) => setCompletionData({ ...completionData, equipmentCosts: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Completion Actions */}
              <div className="flex space-x-3 pt-4 border-t border-border">
                <button
                  onClick={() => setActiveTab('details')}
                  className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  Back to Details
                </button>
                
                <button
                  onClick={handleCompleteWork}
                  disabled={isCompleting || !completionData.completionNotes.trim()}
                  className="flex items-center space-x-2 bg-success text-white px-4 py-2 rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>{isCompleting ? 'Completing...' : 'Complete Work Order'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}