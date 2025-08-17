"use client";

// Mock hooks for development when Convex is not available
const mockWorkOrders = [
  {
    _id: "1",
    workOrderNumber: "WO-2024-001",
    customerName: "John Smith",
    customerPhone: "(555) 123-4567",
    customerEmail: "john@example.com",
    propertyAddress: "123 Oak Street, Springfield, IL 62701",
    serviceType: "Tree Removal",
    jobDescription: "Remove large oak tree near power lines",
    scheduledDate: Date.now() + 86400000, // Tomorrow
    estimatedDuration: 4,
    assignedCrew: ["crew1", "crew2"],
    requiredEquipment: ["crane", "chipper"],
    estimatedCost: 2500,
    status: "scheduled",
    priority: "high",
    createdAt: Date.now() - 86400000, // Yesterday
    isActive: true
  },
  {
    _id: "2", 
    workOrderNumber: "WO-2024-002",
    customerName: "Sarah Johnson",
    customerPhone: "(555) 987-6543",
    customerEmail: "sarah@example.com",
    propertyAddress: "456 Pine Avenue, Springfield, IL 62702",
    serviceType: "Tree Trimming",
    jobDescription: "Trim maple trees along driveway",
    scheduledDate: Date.now() + 172800000, // Day after tomorrow
    estimatedDuration: 2,
    assignedCrew: ["crew1"],
    requiredEquipment: ["bucket_truck"],
    estimatedCost: 800,
    status: "pending",
    priority: "medium", 
    createdAt: Date.now() - 43200000, // 12 hours ago
    isActive: true
  },
  {
    _id: "3",
    workOrderNumber: "WO-2024-003", 
    customerName: "Mike Wilson",
    customerPhone: "(555) 456-7890",
    customerEmail: "mike@example.com",
    propertyAddress: "789 Elm Drive, Springfield, IL 62703",
    serviceType: "Stump Grinding",
    jobDescription: "Grind stumps from recently removed trees",
    actualStartTime: Date.now() - 7200000, // 2 hours ago
    estimatedDuration: 1,
    assignedCrew: ["crew2"],
    requiredEquipment: ["stump_grinder"],
    estimatedCost: 400,
    actualCost: 375,
    laborHours: 1.5,
    status: "in_progress",
    priority: "low",
    createdAt: Date.now() - 172800000, // 2 days ago
    isActive: true
  }
];

// Mock Category Time Tracking Sessions for category-based PpH tracking

const mockPhotos = [
  {
    _id: "photo1",
    storageId: "storage1",
    filename: "before_work.jpg",
    contentType: "image/jpeg",
    description: "Before starting the tree removal",
    category: "before",
    uploadedAt: Date.now() - 3600000,
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop"
  },
  {
    _id: "photo2", 
    storageId: "storage2",
    filename: "equipment_setup.jpg",
    contentType: "image/jpeg",
    description: "Crane positioned for tree removal",
    category: "equipment",
    uploadedAt: Date.now() - 1800000,
    url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop"
  }
];

// Mock Category Time Tracking Sessions for category-based PpH tracking

const mockEmployees = [
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
  }
];

// Mock Category Time Tracking Sessions for category-based PpH tracking

const mockEquipment = [
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
    description: "Heavy-duty skid steer loader for forestry mulching",
    location: "Blue Ridge Court, Keystone Heights, FL"
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
    description: "High-performance forestry mulcher attachment",
    location: "Blue Ridge Court, Keystone Heights, FL"
  }
];

// Mock Category Time Tracking Sessions for category-based PpH tracking

const mockLoadouts = [
  {
    _id: "loadout1",
    name: "Forestry Mulching - Standard",
    description: "Standard forestry mulching setup for residential and light commercial land clearing",
    serviceType: "forestry_mulching",
    complexity: "moderate",
    requiredEquipment: [
      { equipmentId: "eq1", category: "skid_steer", quantity: 1, isOptional: false },
      { equipmentId: "eq2", category: "mulcher", quantity: 1, isOptional: false }
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
  }
];

// Mock Category Time Tracking Sessions for category-based PpH tracking

const mockTimeTrackingSessions = [
  {
    _id: "session1",
    employeeId: "emp1",
    sessionNumber: 1,
    startTime: Date.now() - 3600000,
    endTime: Date.now() - 1800000,
    totalMinutes: 30,
    sessionType: "work",
    location: "5785 Blue Ridge Court, Keystone Heights, FL",
    workDescription: "CAT 265 Skid Steer + Fecon Blackhawk Mulcher - 0.71 acres forestry mulching",
    status: "completed",
    isApproved: true,
    createdAt: Date.now() - 3600000
  }
];

// Mock Category Time Tracking Sessions for category-based PpH tracking

export function useMockQuery(apiCall: string, params?: any) {
  if (apiCall === 'workOrders:list') {
    return mockWorkOrders;
  }
  if (apiCall === 'photos:getPhotosForEntity') {
    return mockPhotos;
  }
  if (apiCall === 'employees:listActive') {
    return mockEmployees;
  }
  if (apiCall === 'equipment:list') {
    return mockEquipment;
  }
  if (apiCall === 'loadouts:list') {
    return mockLoadouts;
  }
  if (apiCall === 'timeTracking:listSessions') {
    return mockTimeTrackingSessions;
  }
  if (apiCall === 'timeTracking:listCategorySessions') {
    return mockCategoryTimeTrackingSessions;
  }
  if (apiCall === 'proposals:list') {
    return mockProposalsData;
  }
  return [];
}

export function useMockMutation(apiCall: string) {
  return async (params: any) => {
    console.log(`Mock mutation ${apiCall} called with:`, params);
    
    // Special handling for Alex AI assessment
    if (apiCall === 'alexAI:performAndStoreAssessment') {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate AI assessment with realistic data
      return {
        status: 'success',
        assessment: {
          tree_measurements: {
            height: 75,
            canopy_radius: 22,
            dbh: 32,
            species: 'Oak',
            condition: 'Healthy but hazardous location'
          },
          afiss_assessment: {
            access_score: 25,
            fall_zone_score: 45,
            interference_score: 65,
            severity_score: 55,
            site_conditions_score: 15,
            composite_score: 45.5
          },
          business_estimates: {
            estimated_hours: 6.5,
            estimated_cost: 3200,
            crew_type: 'Expert',
            equipment_required: ['Crane', 'Chipper', 'Chainsaw', 'Safety Equipment'],
            safety_protocols: ['ISA Arborist Supervision', 'Utility Coordination', 'Property Protection'],
            isa_certified_required: true
          },
          complexity: {
            level: 'high',
            multiplier: 2.3,
            factors: ['Power line proximity', 'Residential location', 'Large tree size']
          },
          treescore: {
            base_score: 5280,
            total_score: 7644
          },
          reasoning: 'This project requires expert-level execution due to power line proximity and residential setting. Enhanced safety protocols and ISA arborist supervision are mandatory.'
        }
      };
    }
    
    if (apiCall === 'timeTracking:startSession') {
      console.log('Starting time tracking session:', params);
      return { success: true, sessionId: `session_${Date.now()}` };
    }
    
    if (apiCall === 'timeTracking:startCategorySession') {
      console.log('Starting category time tracking session:', params);
      // Add the new session to mock data
      const newSession = {
        _id: `session_${Date.now()}`,
        employeeId: params.employeeId,
        employeeName: 'Mock Employee',
        category: params.category,
        categoryName: params.categoryName,
        sessionNumber: 1,
        startTime: Date.now(),
        location: params.location,
        workDescription: params.workDescription,
        equipmentUsed: [],
        status: 'active',
        isApproved: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      // In a real app, this would be saved to the database
      console.log('Mock: Category session started:', newSession);
      return { success: true, sessionId: newSession._id };
    }
    
    if (apiCall === 'timeTracking:endSession') {
      console.log('Ending time tracking session:', params);
      // Update the session in mock data
      // In a real app, this would update the database
      console.log('Mock: Category session ended:', params.sessionId);
      return { success: true };
    }
    
    if (apiCall === 'proposals:create') {
      console.log('Creating proposal:', params);
      return { success: true, proposalId: `prop_${Date.now()}` };
    }
    
    if (apiCall === 'proposals:send') {
      console.log('Sending proposal:', params);
      return { success: true };
    }
    
    if (apiCall === 'proposals:accept') {
      console.log('Accepting proposal and creating work order:', params);
      return { success: true, workOrderId: `wo_${Date.now()}` };
    }
    
    return { success: true };
  };
}

// Mock Proposals Data for the core business pricing engine
const mockProposalsData = [
  {
    _id: "prop1",
    proposalNumber: "PROP-2024-001",
    leadId: "lead1",
    customerName: "John Smith",
    customerEmail: "john@example.com",
    customerPhone: "(555) 123-4567",
    propertyAddress: "123 Oak Street, Springfield, IL 62701",
    status: "sent",
    lineItems: [
      {
        id: "item1",
        description: "Large Oak Tree Removal (60ft, near power lines)",
        quantity: 1,
        unit: "tree",
        unitPrice: 3200,
        totalPrice: 3200,
        treeScoreData: {
          height: 60,
          canopyRadius: 25,
          dbh: 32,
          baseScore: 3750,
          riskMultiplier: 2.1,
          finalScore: 7875,
          businessRulesApplied: ["BR-001", "BR-003", "BR-005"]
        },
        equipmentRequired: ["Crane", "Chipper", "Chainsaw"],
        laborHours: 8,
        complexity: "high",
        laborCost: 1600,
        equipmentCost: 1200,
        materialCost: 100,
        overheadCost: 200,
        profitMargin: 100,
        afissFactors: {
          accessScore: 25,
          fallZoneScore: 45,
          interferenceScore: 65,
          severityScore: 55,
          siteConditionsScore: 15,
          compositeScore: 45.5
        },
        isaArboristRequired: true,
        specialCertificationsRequired: ["Crane Operator", "Aerial Rescue"],
        serviceCategory: "removal",
        urgencyLevel: "high",
        seasonalFactors: ["winter_dormancy"],
        permitsRequired: ["utility_coordination"]
      },
      {
        id: "item2", 
        description: "Stump Grinding (32\" DBH)",
        quantity: 1,
        unit: "stump",
        unitPrice: 450,
        totalPrice: 450,
        equipmentRequired: ["Stump Grinder"],
        laborHours: 2,
        complexity: "low",
        laborCost: 100,
        equipmentCost: 220,
        materialCost: 30,
        overheadCost: 50,
        profitMargin: 50,
        isaArboristRequired: false,
        specialCertificationsRequired: [],
        serviceCategory: "stump_grinding"
      },
      {
        id: "item3",
        description: "Debris Removal and Site Cleanup", 
        quantity: 1,
        unit: "service",
        unitPrice: 350,
        totalPrice: 350,
        equipmentRequired: ["Truck", "Trailer"],
        laborHours: 3,
        complexity: "low",
        laborCost: 150,
        equipmentCost: 135,
        materialCost: 15,
        overheadCost: 35,
        profitMargin: 15,
        isaArboristRequired: false,
        specialCertificationsRequired: [],
        serviceCategory: "cleanup"
      }
    ],
    subtotal: 4000,
    taxRate: 0.08,
    taxAmount: 320,
    totalAmount: 4320,
    validUntil: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
    paymentTerms: "Net 30",
    warrantyTerms: "90 days on workmanship",
    notes: "Project requires ISA Certified Arborist supervision due to power line proximity. Utility coordination included.",
    termsAndConditions: "Standard TreeAI terms apply",
    createdBy: "admin",
    sentAt: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
    alexAIAssessmentId: "assessment1",
    aiGeneratedInsights: [
      "High complexity project requiring expert crew",
      "Power line proximity increases risk significantly", 
      "ISA Arborist supervision mandatory"
    ],
    riskFlags: ["POWER_LINES", "RESIDENTIAL_LOCATION", "LARGE_TREE"],
    version: 1,
    createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
    lastUpdated: Date.now() - (1 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    _id: "prop2",
    proposalNumber: "PROP-2024-002", 
    customerName: "Sarah Johnson",
    customerEmail: "sarah@example.com",
    customerPhone: "(555) 987-6543",
    propertyAddress: "456 Pine Avenue, Springfield, IL 62702",
    status: "approved",
    lineItems: [
      {
        id: "item4",
        description: "Maple Tree Trimming (Crown Reduction)",
        quantity: 3,
        unit: "tree",
        unitPrice: 280,
        totalPrice: 840,
        treeScoreData: {
          height: 35,
          canopyRadius: 15,
          dbh: 18,
          baseScore: 787.5,
          riskMultiplier: 1.3,
          finalScore: 1023.75,
          businessRulesApplied: ["BR-002", "BR-004"]
        },
        equipmentRequired: ["Bucket Truck", "Chainsaw"],
        laborHours: 6,
        complexity: "moderate",
        laborCost: 300,
        equipmentCost: 360,
        materialCost: 60,
        overheadCost: 84,
        profitMargin: 36,
        isaArboristRequired: true,
        specialCertificationsRequired: ["Aerial Lift Operator"],
        serviceCategory: "trimming"
      }
    ],
    subtotal: 840,
    taxRate: 0.08,
    taxAmount: 67.20,
    totalAmount: 907.20,
    validUntil: Date.now() + (25 * 24 * 60 * 60 * 1000),
    paymentTerms: "Net 30",
    notes: "Standard commercial trimming project",
    version: 1,
    createdAt: Date.now() - (5 * 24 * 60 * 60 * 1000),
    sentAt: Date.now() - (4 * 24 * 60 * 60 * 1000),
    viewedAt: Date.now() - (3 * 24 * 60 * 60 * 1000),
    respondedAt: Date.now() - (1 * 24 * 60 * 60 * 1000),
    workOrderId: "wo1",
    conversionDate: Date.now() - (1 * 24 * 60 * 60 * 1000),
    isActive: true
  }
];

// Mock Category Time Tracking Sessions for category-based PpH tracking
const mockCategoryTimeTrackingSessions = [
  {
    _id: "cat_session1",
    employeeId: "emp1",
    employeeName: "Sarah Johnson",
    category: "tree_removal",
    categoryName: "Tree Removal",
    sessionNumber: 1,
    startTime: Date.now() - 3600000, // 1 hour ago
    endTime: Date.now() - 1800000, // 30 minutes ago
    totalMinutes: 30,
    location: "123 Oak Street",
    workDescription: "Large oak removal with crane",
    treeScorePointsCompleted: 2500,
    treesCompleted: 1,
    equipmentUsed: ["crane", "chainsaw", "chipper"],
    projectPhase: "execution",
    status: "completed",
    isApproved: true,
    productivityRating: 9,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 1800000
  },
  {
    _id: "cat_session2",
    employeeId: "emp2", 
    employeeName: "Mike Thompson",
    category: "transport",
    categoryName: "Transport",
    sessionNumber: 1,
    startTime: Date.now() - 1800000, // 30 minutes ago
    totalMinutes: undefined, // Still active
    location: "En route to 456 Pine Ave",
    workDescription: "Driving to next job site",
    equipmentUsed: ["truck", "trailer"],
    projectPhase: "transport",
    status: "active",
    isApproved: false,
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now() - 1800000
  }
];