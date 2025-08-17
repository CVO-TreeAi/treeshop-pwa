"use client";

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useMockQuery, useMockMutation } from '@/hooks/useMockConvex';
import { 
  CubeIcon, 
  PlusIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface LoadoutEquipment {
  equipmentId: string;
  category: string;
  quantity: number;
  isOptional: boolean;
}

interface Loadout {
  _id: string;
  name: string;
  description: string;
  serviceType: string;
  complexity: string;
  requiredEquipment: LoadoutEquipment[];
  minimumCrewSize: number;
  maximumCrewSize: number;
  requiredPositions: string[];
  requiredCertifications: string[];
  isaArboristRequired: boolean;
  estimatedPpH: number;
  estimatedDailyCost: number;
  setupTimeMinutes: number;
  transportTimeMinutes: number;
  baseHourlyRate: number;
  complexityMultiplier: number;
  isActive: boolean;
}

export function LoadoutManager() {
  const [filterServiceType, setFilterServiceType] = useState('all');
  const [filterComplexity, setFilterComplexity] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Try Convex first, fallback to mock data
  const convexLoadouts = useQuery(api.loadouts.list);
  const convexEquipment = useQuery(api.equipment.list);
  
  const mockLoadouts = useMockQuery('loadouts:list');
  const mockEquipment = useMockQuery('equipment:list');
  
  const loadouts = (convexLoadouts || mockLoadouts || mockLoadoutsData) as Loadout[];
  const equipment = convexEquipment || mockEquipment || [];

  const filteredLoadouts = loadouts.filter((loadout) => {
    const matchesService = filterServiceType === 'all' || loadout.serviceType === filterServiceType;
    const matchesComplexity = filterComplexity === 'all' || loadout.complexity === filterComplexity;
    return matchesService && matchesComplexity && loadout.isActive;
  });

  const serviceTypes = [...new Set(loadouts.map(l => l.serviceType))];
  const complexityLevels = ['low', 'moderate', 'high', 'extreme'];

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'low': return 'bg-success/10 text-success';
      case 'moderate': return 'bg-warning/10 text-warning';
      case 'high': return 'bg-destructive/10 text-destructive';
      case 'extreme': return 'bg-purple-500/10 text-purple-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getServiceTypeIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'forestry_mulching': return CubeIcon;
      case 'tree_removal': return WrenchScrewdriverIcon;
      case 'trimming': return WrenchScrewdriverIcon;
      case 'stump_grinding': return WrenchScrewdriverIcon;
      default: return CubeIcon;
    }
  };

  const formatServiceType = (serviceType: string) => {
    return serviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const calculateEstimatedRevenue = (loadout: Loadout, hours: number = 8) => {
    const baseCost = loadout.baseHourlyRate * hours;
    const complexityCost = baseCost * loadout.complexityMultiplier;
    return complexityCost;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Equipment Loadouts</h3>
            <p className="text-sm text-muted-foreground">
              {loadouts.length} total loadouts • {filteredLoadouts.length} matching filters
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Loadout</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={filterServiceType}
            onChange={(e) => setFilterServiceType(e.target.value)}
            className="px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          >
            <option value="all">All Service Types</option>
            {serviceTypes.map((serviceType) => (
              <option key={serviceType} value={serviceType}>
                {formatServiceType(serviceType)}
              </option>
            ))}
          </select>
          
          <select
            value={filterComplexity}
            onChange={(e) => setFilterComplexity(e.target.value)}
            className="px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          >
            <option value="all">All Complexity Levels</option>
            {complexityLevels.map((level) => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loadouts Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredLoadouts.length === 0 ? (
          <div className="text-center py-12">
            <CubeIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground mb-4">
              {filterServiceType !== 'all' || filterComplexity !== 'all'
                ? 'No loadouts match your filters'
                : 'No loadouts created yet'}
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create First Loadout
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredLoadouts.map((loadout) => {
              const ServiceIcon = getServiceTypeIcon(loadout.serviceType);
              const estimatedRevenue = calculateEstimatedRevenue(loadout);

              return (
                <div key={loadout._id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <ServiceIcon className="w-6 h-6 text-primary" />
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">{loadout.name}</h4>
                        <p className="text-sm text-muted-foreground">{formatServiceType(loadout.serviceType)}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(loadout.complexity)}`}>
                      {loadout.complexity.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{loadout.description}</p>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-background rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <ClockIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Productivity</span>
                      </div>
                      <div className="text-lg font-bold text-primary">{loadout.estimatedPpH} PpH</div>
                      <div className="text-xs text-muted-foreground">Points per Hour</div>
                    </div>
                    
                    <div className="bg-background rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <CurrencyDollarIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Daily Revenue</span>
                      </div>
                      <div className="text-lg font-bold text-success">${estimatedRevenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">8-hour estimate</div>
                    </div>
                  </div>

                  {/* Crew Requirements */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <UserGroupIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Crew Requirements</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Size: </span>
                        <span className="text-foreground">{loadout.minimumCrewSize}-{loadout.maximumCrewSize} members</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ISA Required: </span>
                        <span className={loadout.isaArboristRequired ? 'text-warning' : 'text-muted-foreground'}>
                          {loadout.isaArboristRequired ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    
                    {loadout.requiredPositions.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground mb-1">Required Positions:</div>
                        <div className="flex flex-wrap gap-1">
                          {loadout.requiredPositions.map((position, index) => (
                            <span key={index} className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                              {position}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {loadout.requiredCertifications.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground mb-1">Required Certifications:</div>
                        <div className="flex flex-wrap gap-1">
                          {loadout.requiredCertifications.slice(0, 3).map((cert, index) => (
                            <span key={index} className="bg-warning/10 text-warning px-2 py-0.5 rounded-full text-xs">
                              {cert}
                            </span>
                          ))}
                          {loadout.requiredCertifications.length > 3 && (
                            <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
                              +{loadout.requiredCertifications.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Equipment Requirements */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <WrenchScrewdriverIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Equipment Requirements</span>
                    </div>
                    <div className="space-y-1">
                      {loadout.requiredEquipment.slice(0, 4).map((eq, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">
                            {eq.quantity}x {eq.category.replace(/_/g, ' ')}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            eq.isOptional 
                              ? 'bg-muted text-muted-foreground' 
                              : 'bg-success/10 text-success'
                          }`}>
                            {eq.isOptional ? 'Optional' : 'Required'}
                          </span>
                        </div>
                      ))}
                      {loadout.requiredEquipment.length > 4 && (
                        <div className="text-xs text-muted-foreground">
                          +{loadout.requiredEquipment.length - 4} more items
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timing Information */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <ClockIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Timing</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Setup: </span>
                        <span className="text-foreground">{loadout.setupTimeMinutes}min</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Transport: </span>
                        <span className="text-foreground">{loadout.transportTimeMinutes}min</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-muted text-muted-foreground px-3 py-2 rounded-lg text-sm hover:bg-muted/80 transition-colors">
                      View Details
                    </button>
                    <button className="flex-1 bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm hover:bg-primary/20 transition-colors">
                      Edit Loadout
                    </button>
                    <button className="bg-success/10 text-success px-3 py-2 rounded-lg text-sm hover:bg-success/20 transition-colors">
                      Deploy
                    </button>
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
const mockLoadoutsData: Loadout[] = [
  {
    _id: "loadout1",
    name: "Forestry Mulching - Standard",
    description: "Standard forestry mulching setup for residential and light commercial land clearing up to 2 acres",
    serviceType: "forestry_mulching",
    complexity: "moderate",
    requiredEquipment: [
      { equipmentId: "eq1", category: "skid_steer", quantity: 1, isOptional: false },
      { equipmentId: "eq2", category: "mulcher", quantity: 1, isOptional: false },
      { equipmentId: "eq3", category: "truck", quantity: 1, isOptional: false },
      { equipmentId: "eq7", category: "trailer", quantity: 1, isOptional: false }
    ],
    minimumCrewSize: 2,
    maximumCrewSize: 3,
    requiredPositions: ["Equipment Operator", "Crew Lead"],
    requiredCertifications: ["CDL Class A", "Heavy Equipment Operator"],
    isaArboristRequired: false,
    estimatedPpH: 450,
    estimatedDailyCost: 1680,
    setupTimeMinutes: 45,
    transportTimeMinutes: 120,
    baseHourlyRate: 210,
    complexityMultiplier: 1.3,
    isActive: true
  },
  {
    _id: "loadout2", 
    name: "Tree Removal - High Complexity",
    description: "Heavy-duty tree removal for large trees near structures with crane support",
    serviceType: "tree_removal",
    complexity: "high",
    requiredEquipment: [
      { equipmentId: "eq8", category: "crane", quantity: 1, isOptional: false },
      { equipmentId: "eq4", category: "chipper", quantity: 1, isOptional: false },
      { equipmentId: "eq5", category: "chainsaw", quantity: 3, isOptional: false },
      { equipmentId: "eq3", category: "truck", quantity: 2, isOptional: false }
    ],
    minimumCrewSize: 4,
    maximumCrewSize: 6,
    requiredPositions: ["ISA Certified Arborist", "Crane Operator", "Crew Lead", "Groundsman"],
    requiredCertifications: ["ISA Certified Arborist", "Crane Operator", "Aerial Rescue"],
    isaArboristRequired: true,
    estimatedPpH: 320,
    estimatedDailyCost: 2840,
    setupTimeMinutes: 60,
    transportTimeMinutes: 90,
    baseHourlyRate: 355,
    complexityMultiplier: 2.1,
    isActive: true
  },
  {
    _id: "loadout3",
    name: "Stump Grinding - Residential",
    description: "Efficient stump removal for residential properties with standard access",
    serviceType: "stump_grinding", 
    complexity: "low",
    requiredEquipment: [
      { equipmentId: "eq6", category: "stump_grinder", quantity: 1, isOptional: false },
      { equipmentId: "eq3", category: "truck", quantity: 1, isOptional: false },
      { equipmentId: "eq9", category: "rake", quantity: 2, isOptional: true }
    ],
    minimumCrewSize: 2,
    maximumCrewSize: 3,
    requiredPositions: ["Stump Grinder Operator", "Groundsman"],
    requiredCertifications: ["Stump Grinder Certification"],
    isaArboristRequired: false,
    estimatedPpH: 380,
    estimatedDailyCost: 920,
    setupTimeMinutes: 20,
    transportTimeMinutes: 60,
    baseHourlyRate: 115,
    complexityMultiplier: 1.15,
    isActive: true
  },
  {
    _id: "loadout4",
    name: "Tree Trimming - Commercial",
    description: "Commercial tree trimming with aerial equipment for large properties",
    serviceType: "trimming",
    complexity: "moderate",
    requiredEquipment: [
      { equipmentId: "eq10", category: "bucket_truck", quantity: 1, isOptional: false },
      { equipmentId: "eq4", category: "chipper", quantity: 1, isOptional: false },
      { equipmentId: "eq5", category: "chainsaw", quantity: 2, isOptional: false },
      { equipmentId: "eq3", category: "truck", quantity: 1, isOptional: false }
    ],
    minimumCrewSize: 3,
    maximumCrewSize: 4,
    requiredPositions: ["ISA Certified Arborist", "Aerial Operator", "Groundsman"],
    requiredCertifications: ["ISA Certified Arborist", "Aerial Lift Operator"],
    isaArboristRequired: true,
    estimatedPpH: 290,
    estimatedDailyCost: 1560,
    setupTimeMinutes: 35,
    transportTimeMinutes: 75,
    baseHourlyRate: 195,
    complexityMultiplier: 1.45,
    isActive: true
  }
];