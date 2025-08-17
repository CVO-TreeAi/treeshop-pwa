"use client";

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  SparklesIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { CustomerCard } from '@/components/cards/CustomerCard';
import { NewCustomerModal } from '@/components/modals/NewCustomerModal';

export function CustomersView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);

  const customers = useQuery(api.customers.list) || [];
  
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || customer.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && customer.isActive !== false;
  });

  const statusCounts = customers.reduce((counts, customer) => {
    if (customer.isActive !== false) {
      const status = customer.status || 'active';
      counts[status] = (counts[status] || 0) + 1;
    }
    return counts;
  }, {} as Record<string, number>);

  const priorityCounts = customers.reduce((counts, customer) => {
    if (customer.isActive !== false) {
      const priority = customer.priority || 'medium';
      counts[priority] = (counts[priority] || 0) + 1;
    }
    return counts;
  }, {} as Record<string, number>);

  const statusOptions = [
    { value: 'all', label: 'All Customers', count: customers.filter(c => c.isActive !== false).length },
    { value: 'active', label: 'Active', count: statusCounts.active || 0 },
    { value: 'prospective', label: 'Prospective', count: statusCounts.prospective || 0 },
    { value: 'inactive', label: 'Inactive', count: statusCounts.inactive || 0 },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities', count: customers.filter(c => c.isActive !== false).length },
    { value: 'vip', label: 'VIP', count: priorityCounts.vip || 0, icon: StarIcon, color: 'text-yellow-500' },
    { value: 'high', label: 'High', count: priorityCounts.high || 0, icon: ExclamationTriangleIcon, color: 'text-red-500' },
    { value: 'medium', label: 'Medium', count: priorityCounts.medium || 0, icon: ChartBarIcon, color: 'text-blue-500' },
    { value: 'low', label: 'Low', count: priorityCounts.low || 0, icon: ChartBarIcon, color: 'text-gray-500' },
  ];

  // Calculate some quick intelligence metrics
  const totalCustomers = customers.filter(c => c.isActive !== false).length;
  const totalServiceRevenue = customers.reduce((total, customer) => {
    const serviceHistory = customer.serviceHistory || [];
    return total + serviceHistory.reduce((sum: number, service: any) => sum + (service.cost || 0), 0);
  }, 0);

  const avgCustomerValue = totalCustomers > 0 ? totalServiceRevenue / totalCustomers : 0;

  const upcomingServices = customers.reduce((count, customer) => {
    if (customer.predictiveIntelligence?.nextServicePredicted) {
      return count + 1;
    }
    return count;
  }, 0);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Customer Intelligence</h2>
            <p className="text-sm text-muted-foreground">
              Comprehensive customer management and property intelligence
            </p>
          </div>
          <button
            onClick={() => setShowNewCustomerModal(true)}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>New Customer</span>
          </button>
        </div>

        {/* Intelligence Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <BuildingOfficeIcon className="w-5 h-5 text-primary" />
              <div>
                <div className="text-lg font-semibold">{totalCustomers}</div>
                <div className="text-xs text-muted-foreground">Total Customers</div>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-lg font-semibold">${avgCustomerValue.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Avg Customer Value</div>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-lg font-semibold">{upcomingServices}</div>
                <div className="text-xs text-muted-foreground">Predicted Services</div>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-lg font-semibold">
                  {customers.reduce((total, c) => total + (c.treeInventory?.length || 0), 0)}
                </div>
                <div className="text-xs text-muted-foreground">Trees Tracked</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search customers by name, address, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
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

          {/* Priority Filter */}
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setPriorityFilter(option.value)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    priorityFilter === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {IconComponent && <IconComponent className={`w-4 h-4 ${option.color || ''}`} />}
                  <span>{option.label} ({option.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'No customers match your filters' 
                : 'No customers yet'}
            </div>
            <button
              onClick={() => setShowNewCustomerModal(true)}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Your First Customer
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <CustomerCard key={customer._id} customer={customer} />
            ))}
          </div>
        )}
      </div>

      {/* New Customer Modal */}
      {showNewCustomerModal && (
        <NewCustomerModal
          onClose={() => setShowNewCustomerModal(false)}
          onSuccess={() => setShowNewCustomerModal(false)}
        />
      )}
    </div>
  );
}