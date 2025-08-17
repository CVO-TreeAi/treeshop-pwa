"use client";

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useMockQuery } from '@/hooks/useMockConvex';
import { PlusIcon, ClockIcon, CheckCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { WorkOrderDetailModal } from '@/components/modals/WorkOrderDetailModal';
import { PhotoGallery } from '@/components/ui/PhotoGallery';

export function WorkOrdersView() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  
  // Try Convex first, fallback to mock data
  const convexWorkOrders = useQuery(api.workOrders.list);
  const mockWorkOrders = useMockQuery('workOrders:list');
  const workOrders = convexWorkOrders || mockWorkOrders || [];
  
  const filteredWorkOrders = workOrders.filter((wo) => {
    return statusFilter === 'all' || wo.status === statusFilter;
  });

  const statusCounts = workOrders.reduce((counts, wo) => {
    counts[wo.status] = (counts[wo.status] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Work Orders</h2>
          <button className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            <PlusIcon className="w-5 h-5" />
            <span>New Work Order</span>
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All', count: workOrders.length },
            { value: 'pending', label: 'Pending', count: statusCounts.pending || 0 },
            { value: 'scheduled', label: 'Scheduled', count: statusCounts.scheduled || 0 },
            { value: 'in_progress', label: 'In Progress', count: statusCounts.in_progress || 0 },
            { value: 'completed', label: 'Completed', count: statusCounts.completed || 0 },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
      </div>

      {/* Work Orders List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredWorkOrders.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground mb-4">No work orders found</div>
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Create First Work Order
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWorkOrders.map((workOrder) => (
              <div 
                key={workOrder._id} 
                className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedWorkOrder(workOrder)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{workOrder.workOrderNumber}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      workOrder.status === 'completed' ? 'bg-success/10 text-success' :
                      workOrder.status === 'in_progress' ? 'bg-warning/10 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {workOrder.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <PhotoIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{workOrder.customerName}</p>
                <p className="text-sm text-muted-foreground">{workOrder.propertyAddress}</p>
                <div className="mt-3 text-sm">
                  <span className="font-medium">Service:</span> {workOrder.serviceType}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Work Order Detail Modal */}
      {selectedWorkOrder && (
        <WorkOrderDetailModal
          workOrder={selectedWorkOrder}
          onClose={() => setSelectedWorkOrder(null)}
          onUpdate={() => {
            // Refresh would happen automatically due to Convex reactivity
            setSelectedWorkOrder(null);
          }}
        />
      )}
    </div>
  );
}