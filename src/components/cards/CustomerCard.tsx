"use client";

import { useState } from 'react';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  BuildingOfficeIcon,
  StarIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  SparklesIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { AddressDisplay } from '@/components/common/AddressDisplay';

interface Customer {
  _id: string;
  customerName: string;
  email?: string;
  phone?: string;
  company?: string;
  propertyAddress: string;
  propertyCoordinates?: {
    lat: number;
    lng: number;
  };
  status?: string;
  priority?: string;
  tags?: string[];
  
  // Intelligence Systems
  propertyIntelligence?: any;
  treeInventory?: any[];
  financialIntelligence?: any;
  communicationIntelligence?: any;
  serviceHistory?: any[];
  riskAssessment?: any;
  predictiveIntelligence?: any;
  relationshipMapping?: any;
  aiInsights?: any;
  evolutionTracking?: any;
  
  createdAt?: string;
  updatedAt?: string;
  assignedTo?: string;
}

interface CustomerCardProps {
  customer: Customer;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'vip':
        return <StarIcon className="w-4 h-4 text-yellow-500" />;
      case 'high':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <ChartBarIcon className="w-4 h-4 text-blue-500" />;
      case 'low':
        return <ChartBarIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <ChartBarIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'prospective':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Calculate customer intelligence metrics
  const treeCount = customer.treeInventory?.length || 0;
  const serviceCount = customer.serviceHistory?.length || 0;
  const totalSpent = customer.serviceHistory?.reduce((total: number, service: any) => total + (service.cost || 0), 0) || 0;
  const lastServiceDate = customer.serviceHistory?.length > 0 
    ? customer.serviceHistory[customer.serviceHistory.length - 1]?.date 
    : null;

  const nextPredictedService = customer.predictiveIntelligence?.nextServicePredicted;
  const riskLevel = customer.riskAssessment?.paymentRisk || 'low';
  const communicationPreference = customer.communicationIntelligence?.preferences?.contactMethod || 'email';

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-foreground text-lg truncate">
                {customer.customerName}
              </h3>
              {getPriorityIcon(customer.priority)}
            </div>
            
            {customer.company && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
                <BuildingOfficeIcon className="w-4 h-4" />
                <span className="truncate">{customer.company}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end space-y-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
              {customer.status || 'active'}
            </span>
          </div>
        </div>
      </div>

      {/* Contact & Address */}
      <div className="p-4 space-y-3">
        <AddressDisplay 
          address={customer.propertyAddress}
          showCopyButton={true}
          showMapLinks={true}
          className="text-sm"
        />
        
        <div className="flex flex-wrap gap-3 text-sm">
          {customer.phone && (
            <div className="flex items-center space-x-1 text-muted-foreground">
              <PhoneIcon className="w-4 h-4" />
              <span>{customer.phone}</span>
            </div>
          )}
          
          {customer.email && (
            <div className="flex items-center space-x-1 text-muted-foreground">
              <EnvelopeIcon className="w-4 h-4" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Intelligence Metrics */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-4 h-4 text-emerald-600" />
            <span className="text-muted-foreground">
              {treeCount} trees tracked
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
            <span className="text-muted-foreground">
              ${totalSpent.toLocaleString()} total
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <TruckIcon className="w-4 h-4 text-blue-600" />
            <span className="text-muted-foreground">
              {serviceCount} services
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className={`w-4 h-4 ${
              riskLevel === 'low' ? 'text-green-600' : 
              riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
            }`} />
            <span className="text-muted-foreground">
              {riskLevel} risk
            </span>
          </div>
        </div>
      </div>

      {/* Predictive Intelligence */}
      {nextPredictedService && (
        <div className="px-4 pb-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <CalendarIcon className="w-4 h-4 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">
                  Next Service Predicted
                </div>
                <div className="text-xs text-muted-foreground">
                  {nextPredictedService.service} - {nextPredictedService.timeframe}
                </div>
                <div className="text-xs text-muted-foreground">
                  {nextPredictedService.confidence}% confidence
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Communication Preference */}
      <div className="px-4 pb-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <span>Prefers:</span>
            {communicationPreference === 'text' && <PhoneIcon className="w-4 h-4" />}
            {communicationPreference === 'email' && <EnvelopeIcon className="w-4 h-4" />}
            {communicationPreference === 'call' && <PhoneIcon className="w-4 h-4" />}
            <span className="capitalize">{communicationPreference}</span>
          </div>
          
          {lastServiceDate && (
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>Last: {new Date(lastServiceDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {customer.tags && customer.tags.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-1">
            {customer.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {customer.tags.length > 3 && (
              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                +{customer.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          {showDetails ? 'Hide Details' : 'View Full Profile'}
        </button>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="border-t border-border p-4 bg-muted/30">
          <div className="space-y-4 text-sm">
            {/* Property Intelligence */}
            {customer.propertyIntelligence && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Property Intelligence</h4>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  {customer.propertyIntelligence.lotSize && (
                    <div>Lot Size: {customer.propertyIntelligence.lotSize}</div>
                  )}
                  {customer.propertyIntelligence.soilType && (
                    <div>Soil: {customer.propertyIntelligence.soilType}</div>
                  )}
                  {customer.propertyIntelligence.drainage && (
                    <div>Drainage: {customer.propertyIntelligence.drainage}</div>
                  )}
                  {customer.propertyIntelligence.topology && (
                    <div>Topology: {customer.propertyIntelligence.topology}</div>
                  )}
                </div>
              </div>
            )}

            {/* Financial Intelligence */}
            {customer.financialIntelligence && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Financial Profile</h4>
                <div className="text-muted-foreground">
                  {customer.financialIntelligence.spendingCapacity?.spendingTier && (
                    <div>Tier: {customer.financialIntelligence.spendingCapacity.spendingTier}</div>
                  )}
                  {customer.financialIntelligence.paymentPatterns?.paymentReliability && (
                    <div>Payment: {customer.financialIntelligence.paymentPatterns.paymentReliability}</div>
                  )}
                  {customer.financialIntelligence.referralValue?.customersReferred && (
                    <div>Referrals: {customer.financialIntelligence.referralValue.customersReferred}</div>
                  )}
                </div>
              </div>
            )}

            {/* AI Insights */}
            {customer.aiInsights?.smartAlerts && customer.aiInsights.smartAlerts.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-2">AI Insights</h4>
                <div className="space-y-1">
                  {customer.aiInsights.smartAlerts.slice(0, 2).map((alert: string, index: number) => (
                    <div key={index} className="text-muted-foreground text-xs p-2 bg-muted rounded">
                      {alert}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}