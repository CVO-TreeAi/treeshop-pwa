"use client";

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useMockQuery, useMockMutation } from '@/hooks/useMockConvex';
import { 
  WrenchScrewdriverIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Equipment {
  _id: string;
  name: string;
  category: string;
  model?: string;
  manufacturer?: string;
  year?: number;
  status: string;
  hourlyRate: number;
  currentHours?: number;
  maxOperatingHours?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceHours?: number;
  description: string;
  location?: string;
  assignedToWorkOrderId?: string;
}

export function EquipmentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Try Convex first, fallback to mock data
  const convexEquipment = useQuery(api.equipment.list);
  const mockEquipment = useMockQuery('equipment:list');
  const equipment = (convexEquipment || mockEquipment || mockEquipmentData) as Equipment[];

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.manufacturer && item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(equipment.map(item => item.category))];
  const statuses = [...new Set(equipment.map(item => item.status))];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-success/10 text-success';
      case 'in_use': return 'bg-warning/10 text-warning';
      case 'maintenance': return 'bg-info/10 text-info';
      case 'out_of_service': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return CheckCircleIcon;
      case 'in_use': return CogIcon;
      case 'maintenance': return WrenchScrewdriverIcon;
      case 'out_of_service': return ExclamationTriangleIcon;
      default: return CogIcon;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'truck':
      case 'trailer':
        return TruckIcon;
      case 'chainsaw':
      case 'chipper':
      case 'crane':
      case 'stump_grinder':
        return WrenchScrewdriverIcon;
      default:
        return CogIcon;
    }
  };

  const getMaintenanceStatus = (item: Equipment) => {
    if (!item.currentHours || !item.nextMaintenanceHours) return null;
    
    const hoursUntilMaintenance = item.nextMaintenanceHours - item.currentHours;
    
    if (hoursUntilMaintenance <= 0) {
      return { status: 'overdue', message: 'Maintenance Overdue', color: 'text-destructive' };
    } else if (hoursUntilMaintenance <= 10) {
      return { status: 'due', message: `${hoursUntilMaintenance}h until maintenance`, color: 'text-warning' };
    } else {
      return { status: 'good', message: `${hoursUntilMaintenance}h until maintenance`, color: 'text-success' };
    }
  };

  const getUtilizationPercentage = (item: Equipment) => {
    if (!item.currentHours || !item.maxOperatingHours) return 0;
    return Math.min((item.currentHours / item.maxOperatingHours) * 100, 100);
  };

  const equipmentStats = {
    total: equipment.length,
    available: equipment.filter(e => e.status === 'available').length,
    inUse: equipment.filter(e => e.status === 'in_use').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    avgUtilization: equipment.reduce((acc, e) => acc + getUtilizationPercentage(e), 0) / equipment.length
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header & Stats */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Equipment Management</h3>
            <p className="text-sm text-muted-foreground">
              {equipmentStats.total} total • {equipmentStats.available} available • {equipmentStats.inUse} in use
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{equipmentStats.avgUtilization.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Avg Utilization</div>
            </div>
            
            <button className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              <PlusIcon className="w-4 h-4" />
              <span>Add Equipment</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-background rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-success">{equipmentStats.available}</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="bg-background rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-warning">{equipmentStats.inUse}</div>
            <div className="text-xs text-muted-foreground">In Use</div>
          </div>
          <div className="bg-background rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-info">{equipmentStats.maintenance}</div>
            <div className="text-xs text-muted-foreground">Maintenance</div>
          </div>
          <div className="bg-background rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-destructive">
              {equipment.filter(e => {
                const maintenance = getMaintenanceStatus(e);
                return maintenance?.status === 'overdue';
              }).length}
            </div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          >
            <option value="all">All Status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{status.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredEquipment.length === 0 ? (
          <div className="text-center py-12">
            <WrenchScrewdriverIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground mb-4">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' 
                ? 'No equipment matches your filters' 
                : 'No equipment added yet'}
            </div>
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Add First Equipment
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEquipment.map((item) => {
              const StatusIcon = getStatusIcon(item.status);
              const CategoryIcon = getCategoryIcon(item.category);
              const maintenanceStatus = getMaintenanceStatus(item);
              const utilization = getUtilizationPercentage(item);

              return (
                <div key={item._id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <CategoryIcon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold text-foreground">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusIcon className="w-4 h-4" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Equipment Details */}
                  <div className="space-y-2 mb-3">
                    {item.manufacturer && item.model && (
                      <p className="text-sm text-muted-foreground">
                        {item.manufacturer} {item.model} {item.year && `(${item.year})`}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rate:</span>
                      <span className="font-medium text-foreground">${item.hourlyRate}/hr</span>
                    </div>

                    {item.location && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="text-foreground truncate ml-2">{item.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Operating Hours & Utilization */}
                  {item.currentHours && item.maxOperatingHours && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Utilization:</span>
                        <span className="text-foreground">{utilization.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all duration-300"
                          style={{ width: `${utilization}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{item.currentHours}h</span>
                        <span>{item.maxOperatingHours}h max</span>
                      </div>
                    </div>
                  )}

                  {/* Maintenance Status */}
                  {maintenanceStatus && (
                    <div className="mb-3">
                      <div className={`text-sm ${maintenanceStatus.color} flex items-center space-x-2`}>
                        <WrenchScrewdriverIcon className="w-3 h-3" />
                        <span>{maintenanceStatus.message}</span>
                      </div>
                      {item.lastMaintenanceDate && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Last: {item.lastMaintenanceDate}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-muted text-muted-foreground px-3 py-1 rounded text-sm hover:bg-muted/80 transition-colors">
                      View Details
                    </button>
                    <button className="flex-1 bg-primary/10 text-primary px-3 py-1 rounded text-sm hover:bg-primary/20 transition-colors">
                      Edit
                    </button>
                    {item.status === 'available' && (
                      <button className="bg-success/10 text-success px-3 py-1 rounded text-sm hover:bg-success/20 transition-colors">
                        Assign
                      </button>
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
const mockEquipmentData: Equipment[] = [
  {
    _id: "eq1",
    name: "CAT 265 Skid Steer",
    category: "skid_steer",
    manufacturer: "Caterpillar",
    model: "265",
    year: 2022,
    status: "in_use",
    hourlyRate: 85,
    currentHours: 1847,
    maxOperatingHours: 8000,
    lastMaintenanceDate: "2025-07-15",
    nextMaintenanceHours: 2000,
    description: "Heavy-duty skid steer loader for forestry mulching and material handling",
    location: "Blue Ridge Court, Keystone Heights, FL",
    assignedToWorkOrderId: "wo1"
  },
  {
    _id: "eq2", 
    name: "Fecon Blackhawk Mulcher",
    category: "mulcher",
    manufacturer: "Fecon",
    model: "Blackhawk",
    year: 2023,
    status: "in_use",
    hourlyRate: 125,
    currentHours: 892,
    maxOperatingHours: 5000,
    lastMaintenanceDate: "2025-08-01",
    nextMaintenanceHours: 1000,
    description: "High-performance forestry mulcher attachment for land clearing",
    location: "Blue Ridge Court, Keystone Heights, FL",
    assignedToWorkOrderId: "wo1"
  },
  {
    _id: "eq3",
    name: "Freightliner M2 Truck",
    category: "truck",
    manufacturer: "Freightliner",
    model: "M2 106",
    year: 2021,
    status: "available",
    hourlyRate: 45,
    currentHours: 15420,
    maxOperatingHours: 25000,
    lastMaintenanceDate: "2025-08-10",
    nextMaintenanceHours: 16000,
    description: "Heavy-duty truck for equipment transport and crew mobilization",
    location: "Main Yard"
  },
  {
    _id: "eq4",
    name: "Bandit 250XP Chipper",
    category: "chipper",
    manufacturer: "Bandit",
    model: "250XP",
    year: 2020,
    status: "maintenance",
    hourlyRate: 95,
    currentHours: 3240,
    maxOperatingHours: 8000,
    lastMaintenanceDate: "2025-08-15",
    nextMaintenanceHours: 3500,
    description: "High-capacity wood chipper for debris processing",
    location: "Service Shop"
  },
  {
    _id: "eq5",
    name: "Stihl MS 500i Chainsaw",
    category: "chainsaw",
    manufacturer: "Stihl", 
    model: "MS 500i",
    year: 2024,
    status: "available",
    hourlyRate: 12,
    currentHours: 156,
    maxOperatingHours: 1000,
    lastMaintenanceDate: "2025-08-12",
    nextMaintenanceHours: 200,
    description: "Professional chainsaw with fuel injection for tree removal and trimming",
    location: "Tool Room"
  },
  {
    _id: "eq6",
    name: "Carlton 7015 Stump Grinder",
    category: "stump_grinder",
    manufacturer: "Carlton",
    model: "7015",
    year: 2019,
    status: "available", 
    hourlyRate: 110,
    currentHours: 2890,
    maxOperatingHours: 6000,
    lastMaintenanceDate: "2025-07-28",
    nextMaintenanceHours: 3000,
    description: "Self-propelled stump grinder for efficient stump removal",
    location: "Main Yard"
  }
];