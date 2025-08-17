"use client";

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useMockQuery, useMockMutation } from '@/hooks/useMockConvex';
import { 
  UserGroupIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface Employee {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  position: string;
  skillLevel: string;
  hourlyRate: number;
  certifications: string[];
  isActive: boolean;
  performanceMetrics?: {
    totalHours: number;
    avgEfficiency: number;
    safetyScore: number;
    qualityRating: number;
    customerSatisfaction: number;
  };
}

export function EmployeeDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Try Convex first, fallback to mock data
  const convexEmployees = useQuery(api.employees.listActive);
  const mockEmployees = useMockQuery('employees:listActive');
  const employees = (convexEmployees || mockEmployees || mockEmployeeDirectory) as Employee[];

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = filterPosition === 'all' || employee.position === filterPosition;
    return matchesSearch && matchesPosition;
  });

  const positions = [...new Set(employees.map(emp => emp.position))];
  
  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert': return 'bg-success/10 text-success';
      case 'experienced': return 'bg-warning/10 text-warning';
      case 'beginner': return 'bg-info/10 text-info';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header & Controls */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Employee Directory</h3>
            <p className="text-sm text-muted-foreground">{employees.length} total employees • {employees.filter(e => e.isActive).length} active</p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
          </div>
          
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          >
            <option value="all">All Positions</option>
            {positions.map((position) => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground mb-4">
              {searchTerm || filterPosition !== 'all' ? 'No employees match your filters' : 'No employees added yet'}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add First Employee
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map((employee) => (
              <div key={employee._id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{employee.name}</h4>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(employee.skillLevel)}`}>
                    {employee.skillLevel}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-1 mb-3">
                  {employee.phone && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <PhoneIcon className="w-3 h-3" />
                      <span>{employee.phone}</span>
                    </div>
                  )}
                  {employee.email && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <EnvelopeIcon className="w-3 h-3" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                  )}
                </div>

                {/* Rate */}
                <div className="mb-3">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">${employee.hourlyRate}/hr</span>
                  </div>
                </div>

                {/* Certifications */}
                {employee.certifications.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <ShieldCheckIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Certifications</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {employee.certifications.slice(0, 2).map((cert, index) => (
                        <span key={index} className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                          {cert}
                        </span>
                      ))}
                      {employee.certifications.length > 2 && (
                        <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
                          +{employee.certifications.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                {employee.performanceMetrics && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <StarIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Performance</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Efficiency: </span>
                        <span className={`font-medium ${getPerformanceColor(employee.performanceMetrics.avgEfficiency)}`}>
                          {employee.performanceMetrics.avgEfficiency}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Safety: </span>
                        <span className={`font-medium ${getPerformanceColor(employee.performanceMetrics.safetyScore)}`}>
                          {employee.performanceMetrics.safetyScore}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quality: </span>
                        <span className={`font-medium ${getPerformanceColor(employee.performanceMetrics.qualityRating)}`}>
                          {employee.performanceMetrics.qualityRating}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Hours: </span>
                        <span className="font-medium text-foreground">
                          {employee.performanceMetrics.totalHours}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-muted text-muted-foreground px-3 py-1 rounded text-sm hover:bg-muted/80 transition-colors">
                    View Details
                  </button>
                  <button className="flex-1 bg-primary/10 text-primary px-3 py-1 rounded text-sm hover:bg-primary/20 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Mock data for development
const mockEmployeeDirectory: Employee[] = [
  {
    _id: "emp1",
    name: "John Martinez",
    email: "john.martinez@treeai.app",
    phone: "(555) 123-4567",
    position: "Equipment Operator",
    skillLevel: "Expert",
    hourlyRate: 28,
    certifications: ["CDL Class A", "Heavy Equipment Operator", "Crane Operator"],
    isActive: true,
    performanceMetrics: {
      totalHours: 1840,
      avgEfficiency: 92,
      safetyScore: 98,
      qualityRating: 89,
      customerSatisfaction: 94
    }
  },
  {
    _id: "emp2",
    name: "Sarah Johnson",
    email: "sarah.johnson@treeai.app", 
    phone: "(555) 987-6543",
    position: "ISA Certified Arborist",
    skillLevel: "Expert",
    hourlyRate: 35,
    certifications: ["ISA Certified Arborist", "Tree Risk Assessment", "Aerial Rescue"],
    isActive: true,
    performanceMetrics: {
      totalHours: 2100,
      avgEfficiency: 95,
      safetyScore: 100,
      qualityRating: 96,
      customerSatisfaction: 98
    }
  },
  {
    _id: "emp3",
    name: "Mike Thompson",
    email: "mike.thompson@treeai.app",
    phone: "(555) 456-7890", 
    position: "Crew Lead",
    skillLevel: "Experienced",
    hourlyRate: 25,
    certifications: ["First Aid/CPR", "OSHA 30", "Forklift Operator"],
    isActive: true,
    performanceMetrics: {
      totalHours: 1560,
      avgEfficiency: 87,
      safetyScore: 95,
      qualityRating: 88,
      customerSatisfaction: 91
    }
  },
  {
    _id: "emp4",
    name: "David Wilson",
    email: "david.wilson@treeai.app",
    phone: "(555) 321-9876",
    position: "Groundsman",
    skillLevel: "Experienced", 
    hourlyRate: 18,
    certifications: ["First Aid/CPR", "Chainsaw Safety"],
    isActive: true,
    performanceMetrics: {
      totalHours: 1200,
      avgEfficiency: 82,
      safetyScore: 92,
      qualityRating: 85,
      customerSatisfaction: 88
    }
  },
  {
    _id: "emp5",
    name: "Alex Rodriguez",
    email: "alex.rodriguez@treeai.app",
    phone: "(555) 654-3210",
    position: "Stump Grinder Operator", 
    skillLevel: "Experienced",
    hourlyRate: 22,
    certifications: ["Stump Grinder Certification", "Equipment Maintenance"],
    isActive: true,
    performanceMetrics: {
      totalHours: 980,
      avgEfficiency: 89,
      safetyScore: 94,
      qualityRating: 87,
      customerSatisfaction: 90
    }
  }
];