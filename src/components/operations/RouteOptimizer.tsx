"use client";

import { useState, useEffect } from 'react';
import { 
  MapIcon,
  ClockIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  AdjustmentsHorizontalIcon,
  MapIcon as NavigationIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { AddressDisplay } from '@/components/common/AddressDisplay';

interface WorkOrder {
  id: string;
  customerName: string;
  address: string;
  services: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: number;
  status: string;
  scheduledDate?: string;
}

interface RouteOptimizerProps {
  workOrders: WorkOrder[];
  crewLocation?: string;
  onOptimizedRoute?: (route: any) => void;
}

interface OptimizedRoute {
  work_order_id: string;
  address: string;
  estimated_duration: number;
  travel_time: number;
  distance_miles: number;
  fuel_cost: number;
  total_time: number;
  priority_score: number;
  optimization_score: number;
}

interface OptimizationSummary {
  total_jobs: number;
  total_travel_time: number;
  total_work_time: number;
  total_day_time: number;
  total_distance_miles: number;
  total_fuel_cost: number;
  optimization_criteria: string;
  within_time_limit: boolean;
  efficiency_rating: number;
}

export function RouteOptimizer({ workOrders, crewLocation, onOptimizedRoute }: RouteOptimizerProps) {
  const [optimizedRoutes, setOptimizedRoutes] = useState<OptimizedRoute[]>([]);
  const [optimizationSummary, setOptimizationSummary] = useState<OptimizationSummary | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationCriteria, setOptimizationCriteria] = useState<'time' | 'distance' | 'fuel'>('time');
  const [maxTravelTime, setMaxTravelTime] = useState(480); // 8 hours
  const [showDetails, setShowDetails] = useState(false);
  const [crewLocationInput, setCrewLocationInput] = useState(crewLocation || '');
  const [selectedJobs, setSelectedJobs] = useState<string[]>(workOrders.map(wo => wo.id));

  useEffect(() => {
    if (crewLocation) {
      setCrewLocationInput(crewLocation);
    }
  }, [crewLocation]);

  const handleOptimizeRoute = async () => {
    if (selectedJobs.length === 0) {
      alert('Please select at least one job to optimize');
      return;
    }

    setIsOptimizing(true);
    try {
      // Prepare work orders for optimization
      const jobsToOptimize = workOrders
        .filter(wo => selectedJobs.includes(wo.id))
        .map(wo => ({
          id: wo.id,
          address: wo.address,
          estimated_duration: wo.estimatedDuration,
          priority: wo.priority
        }));

      const response = await fetch('/api/maps/distance-matrix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          work_orders: jobsToOptimize,
          crew_location: crewLocationInput || undefined,
          optimize_for: optimizationCriteria,
          max_travel_time: maxTravelTime
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Optimization failed');
      }

      const data = await response.json();
      setOptimizedRoutes(data.optimized_routes);
      setOptimizationSummary(data.optimization_summary);
      
      if (onOptimizedRoute) {
        onOptimizedRoute(data);
      }
    } catch (error) {
      console.error('Route optimization error:', error);
      alert(`Failed to optimize route: ${error.message}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <NavigationIcon className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Route Optimizer</h3>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Configuration */}
      {showDetails && (
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="space-y-4">
            {/* Crew Location */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Crew Starting Location (Optional)
              </label>
              <input
                type="text"
                value={crewLocationInput}
                onChange={(e) => setCrewLocationInput(e.target.value)}
                placeholder="Enter starting address or leave blank to start from first job"
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
              />
            </div>

            {/* Optimization Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Optimize For
                </label>
                <select
                  value={optimizationCriteria}
                  onChange={(e) => setOptimizationCriteria(e.target.value as 'time' | 'distance' | 'fuel')}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
                >
                  <option value="time">Minimize Time</option>
                  <option value="distance">Minimize Distance</option>
                  <option value="fuel">Minimize Fuel Cost</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Max Travel Time (minutes)
                </label>
                <input
                  type="number"
                  value={maxTravelTime}
                  onChange={(e) => setMaxTravelTime(parseInt(e.target.value) || 480)}
                  min="60"
                  max="720"
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Selected Jobs
                </label>
                <div className="text-sm text-muted-foreground">
                  {selectedJobs.length} of {workOrders.length} jobs selected
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Selection */}
      <div className="p-4 border-b border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">Select Jobs to Include</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {workOrders.map((workOrder) => (
            <div
              key={workOrder.id}
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                selectedJobs.includes(workOrder.id)
                  ? 'bg-primary/10 border-primary/20'
                  : 'bg-muted/30 border-border hover:bg-muted/50'
              }`}
              onClick={() => toggleJobSelection(workOrder.id)}
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                selectedJobs.includes(workOrder.id)
                  ? 'bg-primary border-primary'
                  : 'border-muted-foreground'
              }`}>
                {selectedJobs.includes(workOrder.id) && (
                  <CheckCircleIcon className="w-3 h-3 text-primary-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-foreground text-sm">{workOrder.customerName}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(workOrder.priority)}`}>
                    {workOrder.priority}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {workOrder.address} • {formatTime(workOrder.estimatedDuration)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {workOrder.services.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Button */}
      <div className="p-4 border-b border-border">
        <button
          onClick={handleOptimizeRoute}
          disabled={isOptimizing || selectedJobs.length === 0}
          className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isOptimizing ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
          ) : (
            <MapIcon className="w-5 h-5" />
          )}
          <span>{isOptimizing ? 'Optimizing Route...' : 'Optimize Route'}</span>
        </button>
      </div>

      {/* Optimization Summary */}
      {optimizationSummary && (
        <div className="p-4 border-b border-border">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
            <LightBulbIcon className="w-4 h-4 text-primary" />
            <span>Optimization Summary</span>
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">{optimizationSummary.total_jobs}</div>
              <div className="text-xs text-muted-foreground">Total Jobs</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">{formatTime(optimizationSummary.total_day_time)}</div>
              <div className="text-xs text-muted-foreground">Total Time</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">{optimizationSummary.total_distance_miles.toFixed(1)} mi</div>
              <div className="text-xs text-muted-foreground">Distance</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">${optimizationSummary.total_fuel_cost.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Fuel Cost</div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {optimizationSummary.within_time_limit ? (
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
              ) : (
                <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm text-muted-foreground">
                {optimizationSummary.within_time_limit ? 'Within time limit' : 'Exceeds time limit'}
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Efficiency: {optimizationSummary.efficiency_rating.toFixed(1)}/10
            </div>
          </div>
        </div>
      )}

      {/* Optimized Route */}
      {optimizedRoutes.length > 0 && (
        <div className="p-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Optimized Route Order</h4>
          <div className="space-y-3">
            {optimizedRoutes.map((route, index) => {
              const workOrder = workOrders.find(wo => wo.id === route.work_order_id);
              if (!workOrder) return null;

              return (
                <div key={route.work_order_id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-foreground text-sm">{workOrder.customerName}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(workOrder.priority)}`}>
                        {workOrder.priority}
                      </span>
                    </div>
                    
                    <AddressDisplay 
                      address={workOrder.address}
                      showCopyButton={true}
                      showMapLinks={true}
                      className="text-xs mb-2"
                    />
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="flex items-center space-x-1">
                        <TruckIcon className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{formatTime(route.travel_time)} travel</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{formatTime(route.estimated_duration)} work</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <MapIcon className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{route.distance_miles.toFixed(1)} mi</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <CurrencyDollarIcon className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">${route.fuel_cost.toFixed(2)} fuel</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}