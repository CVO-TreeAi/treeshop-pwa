import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Customers table - Comprehensive customer intelligence system
  customers: defineTable({
    // Basic Information
    customerName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    propertyAddress: v.string(),
    propertyCoordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number()
    })),
    
    // Intelligence Systems - stored as JSON objects for flexibility
    propertyIntelligence: v.optional(v.any()),
    treeInventory: v.optional(v.any()),
    financialIntelligence: v.optional(v.any()),
    communicationIntelligence: v.optional(v.any()),
    serviceHistory: v.optional(v.any()),
    riskAssessment: v.optional(v.any()),
    predictiveIntelligence: v.optional(v.any()),
    relationshipMapping: v.optional(v.any()),
    aiInsights: v.optional(v.any()),
    evolutionTracking: v.optional(v.any()),
    
    // Status and Tracking
    status: v.optional(v.string()), // 'active', 'inactive', 'prospective', 'blacklisted'
    tags: v.optional(v.array(v.string())),
    priority: v.optional(v.string()), // 'low', 'medium', 'high', 'vip'
    
    // System Fields
    createdAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    isActive: v.optional(v.boolean())
  })
  .index("by_address", ["propertyAddress"])
  .index("by_status", ["status"])
  .index("by_priority", ["priority"])
  .index("by_assignedTo", ["assignedTo"])
  .index("by_customerName", ["customerName"]),

  // Leads table - Customer lead management
  leads: defineTable({
    customerName: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    company: v.optional(v.string()),
    propertyAddress: v.string(),
    serviceType: v.string(), // 'removal', 'trimming', 'stump_grinding', 'emergency', 'consultation'
    urgencyLevel: v.string(), // 'low', 'medium', 'high', 'emergency'
    leadSource: v.string(), // 'website', 'referral', 'google', 'facebook', 'phone', 'walk_in'
    estimatedTreeCount: v.number(),
    estimatedProjectValue: v.string(), // '$0-500', '$500-1500', '$1500-3000', '$3000+'
    notes: v.optional(v.string()),
    status: v.string(), // 'new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'
    qualificationScore: v.optional(v.number()),
    createdAt: v.number(),
    lastUpdated: v.optional(v.number()),
    assignedTo: v.optional(v.string()),
    followUpDate: v.optional(v.number()),
    isActive: v.optional(v.boolean())
  })
  .index("by_status", ["status"])
  .index("by_created", ["createdAt"])
  .index("by_assigned", ["assignedTo"]),

  // Work Orders table - Job scheduling and execution
  workOrders: defineTable({
    // Reference Information
    leadId: v.optional(v.string()),
    workOrderNumber: v.string(),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    propertyAddress: v.string(),
    
    // Job Details
    serviceType: v.string(),
    jobDescription: v.string(),
    scheduledDate: v.optional(v.number()),
    estimatedDuration: v.optional(v.number()), // hours
    actualStartTime: v.optional(v.number()),
    actualEndTime: v.optional(v.number()),
    
    // Crew and Equipment
    assignedCrew: v.array(v.string()), // employee IDs
    requiredEquipment: v.array(v.string()), // equipment IDs
    crewLeadId: v.optional(v.string()),
    
    // Pricing and Costs
    estimatedCost: v.number(),
    actualCost: v.optional(v.number()),
    laborHours: v.optional(v.number()),
    materialCosts: v.optional(v.number()),
    equipmentCosts: v.optional(v.number()),
    
    // TreeScore Integration
    treeScoreCalculations: v.optional(v.array(v.object({
      treeId: v.string(),
      measurements: v.object({
        height: v.number(),
        canopyRadius: v.number(),
        dbh: v.number(),
        species: v.optional(v.string())
      }),
      hazardFactors: v.object({
        pool: v.boolean(),
        fence: v.boolean(),
        structures: v.boolean(),
        utilities: v.boolean(),
        permitting: v.boolean(),
        steepTerrain: v.boolean(),
        softSoil: v.boolean(),
        limitedAccess: v.boolean(),
        nearbyVehicles: v.boolean(),
        glassWindows: v.boolean(),
        septicTank: v.boolean(),
        overheadLines: v.boolean(),
        undergroundUtilities: v.boolean()
      }),
      results: v.object({
        baseTreeScore: v.number(),
        hazardImpact: v.number(),
        finalTreeScore: v.number(),
        totalCost: v.number(),
        businessRules: v.array(v.string()),
        riskFlags: v.array(v.string())
      })
    }))),
    
    // Status and Progress
    status: v.string(), // 'pending', 'scheduled', 'in_progress', 'completed', 'cancelled'
    priority: v.string(), // 'low', 'medium', 'high', 'emergency'
    completionNotes: v.optional(v.string()),
    customerSignature: v.optional(v.string()),
    photos: v.optional(v.array(v.string())), // photo URLs
    
    // Metadata
    createdAt: v.number(),
    lastUpdated: v.optional(v.number()),
    isActive: v.boolean()
  })
  .index("by_status", ["status"])
  .index("by_scheduled_date", ["scheduledDate"])
  .index("by_crew_lead", ["crewLeadId"]),

  // Equipment table - Tools and machinery tracking
  equipment: defineTable({
    name: v.string(),
    category: v.string(), // 'chainsaw', 'chipper', 'truck', 'crane', 'stump_grinder', 'safety_gear'
    model: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    year: v.optional(v.number()),
    serialNumber: v.optional(v.string()),
    
    // Financial data
    purchasePrice: v.optional(v.number()),
    currentValue: v.optional(v.number()),
    hourlyRate: v.number(),
    hourlyDepreciationRate: v.optional(v.number()),
    
    // Operational data
    requiredForComplexity: v.array(v.string()), // ['LOW', 'MODERATE', 'HIGH', 'EXTREME']
    maxOperatingHours: v.optional(v.number()),
    currentHours: v.optional(v.number()),
    
    // Maintenance data
    lastMaintenanceDate: v.optional(v.string()),
    nextMaintenanceHours: v.optional(v.number()),
    maintenanceCostPerHour: v.optional(v.number()),
    
    // Status and availability
    status: v.string(), // 'available', 'in_use', 'maintenance', 'out_of_service'
    location: v.optional(v.string()),
    assignedToWorkOrderId: v.optional(v.string()),
    
    // Notes and description
    description: v.string(),
    operatingNotes: v.optional(v.string()),
    isActive: v.boolean(),
    
    // Metadata
    createdAt: v.number(),
    lastUpdated: v.number()
  })
  .index("by_status", ["status"])
  .index("by_category", ["category"]),

  // Employees table - Staff and crew management
  employees: defineTable({
    // Basic Information
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    employeeId: v.optional(v.string()),
    
    // Employment Details
    position: v.string(), // 'crew_lead', 'arborist', 'groundsman', 'equipment_operator', 'safety_officer'
    skillLevel: v.string(), // 'beginner', 'experienced', 'expert'
    hireDate: v.optional(v.string()),
    employmentType: v.optional(v.string()), // 'full_time', 'part_time', 'contractor', 'seasonal'
    
    // Compensation
    hourlyRate: v.number(),
    overtimeRate: v.optional(v.number()),
    skillPremium: v.optional(v.number()),
    
    // Certifications and Training
    certifications: v.array(v.string()),
    certificationExpiries: v.optional(v.object({})),
    specialties: v.optional(v.array(v.string())),
    equipmentCertified: v.optional(v.array(v.string())),
    
    // Availability and Scheduling
    isActive: v.boolean(),
    maxHoursPerWeek: v.optional(v.number()),
    
    // Performance Metrics
    performanceMetrics: v.optional(v.object({
      totalHours: v.number(),
      avgEfficiency: v.number(),
      safetyScore: v.number(),
      qualityRating: v.number(),
      customerSatisfaction: v.number()
    })),
    
    // Metadata
    createdAt: v.number(),
    lastUpdated: v.number()
  })
  .index("by_position", ["position"])
  .index("by_skill_level", ["skillLevel"]),

  // Invoices table - Billing and payment tracking
  invoices: defineTable({
    // Reference Information
    invoiceNumber: v.string(),
    workOrderId: v.optional(v.string()),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    billingAddress: v.string(),
    
    // Invoice Details
    issueDate: v.number(),
    dueDate: v.number(),
    serviceDate: v.optional(v.number()),
    
    // Line Items
    lineItems: v.array(v.object({
      description: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      totalPrice: v.number(),
      treeScoreId: v.optional(v.string()) // Link to TreeScore calculation
    })),
    
    // Totals
    subtotal: v.number(),
    taxRate: v.optional(v.number()),
    taxAmount: v.optional(v.number()),
    totalAmount: v.number(),
    amountPaid: v.optional(v.number()),
    balance: v.optional(v.number()),
    
    // Payment Information
    paymentStatus: v.string(), // 'pending', 'partial', 'paid', 'overdue'
    paymentMethod: v.optional(v.string()),
    paymentDate: v.optional(v.number()),
    
    // Notes and Terms
    notes: v.optional(v.string()),
    terms: v.optional(v.string()),
    
    // Metadata
    createdAt: v.number(),
    lastUpdated: v.optional(v.number()),
    isActive: v.boolean()
  })
  .index("by_status", ["paymentStatus"])
  .index("by_due_date", ["dueDate"])
  .index("by_customer", ["customerName"]),

  // Proposals table - Core business pricing engine with line-item accuracy
  proposals: defineTable({
    // Reference Information
    proposalNumber: v.string(),
    leadId: v.optional(v.id("leads")),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    propertyAddress: v.string(),
    
    // Proposal Status
    status: v.string(), // 'draft', 'sent', 'viewed', 'approved', 'rejected', 'expired'
    
    // Line Items - The core pricing engine
    lineItems: v.array(v.object({
      id: v.string(),
      description: v.string(),
      quantity: v.number(),
      unit: v.string(), // 'tree', 'stump', 'hour', 'service', 'sqft', 'acre'
      unitPrice: v.number(),
      totalPrice: v.number(),
      
      // TreeScore Integration for accurate pricing
      treeScoreData: v.optional(v.object({
        height: v.number(),
        canopyRadius: v.number(),
        dbh: v.number(),
        baseScore: v.number(),
        riskMultiplier: v.number(),
        finalScore: v.number(),
        businessRulesApplied: v.array(v.string()) // BR-001, BR-002, etc.
      })),
      
      // Resource Requirements for accurate costing
      equipmentRequired: v.array(v.string()), // Equipment names/IDs
      laborHours: v.number(),
      complexity: v.string(), // 'low', 'moderate', 'high', 'extreme'
      
      // Cost Breakdown
      laborCost: v.optional(v.number()),
      equipmentCost: v.optional(v.number()),
      materialCost: v.optional(v.number()),
      overheadCost: v.optional(v.number()),
      profitMargin: v.optional(v.number()),
      
      // AFISS Risk Assessment Data
      afissFactors: v.optional(v.object({
        accessScore: v.number(),
        fallZoneScore: v.number(), 
        interferenceScore: v.number(),
        severityScore: v.number(),
        siteConditionsScore: v.number(),
        compositeScore: v.number()
      })),
      
      // ISA Requirements
      isaArboristRequired: v.boolean(),
      specialCertificationsRequired: v.array(v.string()),
      
      // Service-Specific Data
      serviceCategory: v.string(), // 'removal', 'trimming', 'stump_grinding', 'emergency', 'consultation'
      urgencyLevel: v.optional(v.string()),
      seasonalFactors: v.optional(v.array(v.string())),
      permitsRequired: v.optional(v.array(v.string()))
    })),
    
    // Financial Totals
    subtotal: v.number(),
    taxRate: v.number(),
    taxAmount: v.number(),
    totalAmount: v.number(),
    discountAmount: v.optional(v.number()),
    discountReason: v.optional(v.string()),
    
    // Terms and Conditions
    validUntil: v.number(), // Expiration timestamp
    paymentTerms: v.optional(v.string()),
    warrantyTerms: v.optional(v.string()),
    notes: v.optional(v.string()),
    termsAndConditions: v.optional(v.string()),
    
    // Approval Workflow
    createdBy: v.optional(v.string()),
    approvedBy: v.optional(v.string()),
    sentAt: v.optional(v.number()),
    viewedAt: v.optional(v.number()),
    respondedAt: v.optional(v.number()),
    
    // Alex AI Integration
    alexAIAssessmentId: v.optional(v.id("aiAssessments")),
    aiGeneratedInsights: v.optional(v.array(v.string())),
    riskFlags: v.optional(v.array(v.string())),
    
    // Conversion to Work Order
    workOrderId: v.optional(v.id("workOrders")), // Set when proposal is accepted
    conversionDate: v.optional(v.number()),
    
    // Version Control (for proposal revisions)
    version: v.number(),
    parentProposalId: v.optional(v.id("proposals")),
    revisionReason: v.optional(v.string()),
    
    // Metadata
    createdAt: v.number(),
    lastUpdated: v.optional(v.number()),
    isActive: v.boolean()
  })
  .index("by_status", ["status"])
  .index("by_customer", ["customerName"])
  .index("by_leadId", ["leadId"])
  .index("by_validUntil", ["validUntil"])
  .index("by_createdAt", ["createdAt"])
  .index("by_workOrderId", ["workOrderId"]),

  // Business Settings table - App configuration
  businessSettings: defineTable({
    settingKey: v.string(),
    settingValue: v.any(),
    category: v.string(), // 'general', 'pricing', 'operations', 'notifications'
    description: v.string(),
    dataType: v.string(), // 'string', 'number', 'boolean', 'object'
    isPublic: v.boolean(),
    
    // Metadata
    createdAt: v.number(),
    lastUpdated: v.number()
  })
  .index("by_category", ["category"])
  .index("by_key", ["settingKey"]),

  // Alex AI Conversations - AI assistant interactions
  alexConversations: defineTable({
    sessionId: v.string(),
    userId: v.optional(v.string()), // For future user management
    messages: v.array(v.object({
      role: v.string(), // 'user', 'assistant', 'system'
      content: v.string(),
      timestamp: v.number()
    })),
    context: v.optional(v.object({
      currentWorkOrder: v.optional(v.string()),
      currentLead: v.optional(v.string()),
      lastTreeScoreCalculation: v.optional(v.string())
    })),
    isActive: v.boolean(),
    createdAt: v.number(),
    lastUpdated: v.number()
  })
  .index("by_session", ["sessionId"])
  .index("by_created", ["createdAt"]),

  // Photos table - File storage for images
  photos: defineTable({
    storageId: v.string(), // Convex storage ID
    filename: v.string(),
    contentType: v.string(),
    entityType: v.string(), // 'work_order', 'equipment', 'lead', 'employee', 'invoice'
    entityId: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()), // 'before', 'during', 'after', 'damage', 'equipment', 'profile'
    uploadedAt: v.number(),
    updatedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    isActive: v.boolean()
  })
  .index("by_entity", ["entityType", "entityId"])
  .index("by_category", ["category"])
  .index("by_uploaded", ["uploadedAt"]),

  // Equipment Loadouts - Predefined equipment combinations for job types
  loadouts: defineTable({
    name: v.string(),
    description: v.string(),
    serviceType: v.string(), // 'tree_removal', 'trimming', 'stump_grinding', 'emergency', 'forestry_mulching'
    complexity: v.string(), // 'low', 'moderate', 'high', 'extreme'
    
    // Equipment Requirements
    requiredEquipment: v.array(v.object({
      equipmentId: v.id("equipment"),
      category: v.string(),
      quantity: v.number(),
      isOptional: v.boolean()
    })),
    
    // Crew Requirements
    minimumCrewSize: v.number(),
    maximumCrewSize: v.number(),
    requiredPositions: v.array(v.string()),
    requiredCertifications: v.array(v.string()),
    isaArboristRequired: v.boolean(),
    
    // Performance Estimates (like the project report shows)
    estimatedPpH: v.number(), // Points per Hour productivity
    estimatedDailyCost: v.number(),
    setupTimeMinutes: v.number(),
    transportTimeMinutes: v.number(),
    
    // Pricing
    baseHourlyRate: v.number(),
    complexityMultiplier: v.number(),
    
    // Metadata
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
  .index("by_serviceType", ["serviceType"])
  .index("by_complexity", ["complexity"])
  .index("by_isActive", ["isActive"]),

  // Time Tracking Sessions (Session-based like the project report: Session 1: 2.92 hours, Session 2: 4.17 hours)
  timeTrackingSessions: defineTable({
    employeeId: v.id("employees"),
    workOrderId: v.optional(v.id("workOrders")),
    sessionNumber: v.number(), // 1, 2, 3... for multiple sessions per day
    
    // Session Time Details
    startTime: v.number(),
    endTime: v.optional(v.number()),
    totalMinutes: v.optional(v.number()),
    sessionType: v.string(), // 'work', 'break', 'lunch', 'travel', 'setup', 'cleanup'
    
    // Location & Context
    location: v.optional(v.string()),
    gpsCoordinates: v.optional(v.array(v.number())), // [latitude, longitude]
    workDescription: v.optional(v.string()),
    notes: v.optional(v.string()),
    
    // Break Details (if session_type is break/lunch)
    breakType: v.optional(v.string()), // 'lunch', 'break', 'personal', 'weather'
    breakReason: v.optional(v.string()),
    
    // Project Association
    projectPhase: v.optional(v.string()), // 'transport', 'setup', 'execution', 'cleanup'
    equipmentUsed: v.array(v.id("equipment")),
    loadoutUsed: v.optional(v.id("loadouts")),
    
    // Performance Metrics (like project report efficiency tracking)
    productivityRating: v.optional(v.number()), // 1-10 scale
    efficiencyNotes: v.optional(v.string()),
    pointsCompleted: v.optional(v.number()), // TreeScore points completed this session
    
    // Safety & Incidents
    safetyIncidents: v.array(v.object({
      type: v.string(),
      description: v.string(),
      severity: v.string(),
      timestamp: v.number()
    })),
    
    // Status & Approval
    status: v.string(), // 'active', 'paused', 'completed', 'cancelled'
    isApproved: v.boolean(),
    approvedBy: v.optional(v.id("employees")),
    approvedAt: v.optional(v.number()),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number()
  })
  .index("by_employee", ["employeeId"])
  .index("by_workOrder", ["workOrderId"])
  .index("by_startTime", ["startTime"])
  .index("by_status", ["status"])
  .index("by_sessionType", ["sessionType"]),

  // Alex AI Assessment Storage
  aiAssessments: defineTable({
    projectDescription: v.string(),
    assessmentData: v.any(), // Full Alex AI response
    modelUsed: v.string(), // "claude-3-5-sonnet-20241022"
    assessmentTimestamp: v.number(),
    requestId: v.string(),
    
    // Structured Assessment Results
    treeScore: v.optional(v.object({
      baseScore: v.number(),
      totalScore: v.number(),
      height: v.number(),
      canopyRadius: v.number(),
      dbh: v.number()
    })),
    
    afissScores: v.optional(v.object({
      accessScore: v.number(),
      fallZoneScore: v.number(),
      interferenceScore: v.number(),
      severityScore: v.number(),
      siteConditionsScore: v.number(),
      compositeScore: v.number()
    })),
    
    businessEstimates: v.optional(v.object({
      estimatedHours: v.number(),
      estimatedCost: v.number(),
      crewType: v.string(),
      equipmentRequired: v.array(v.string()),
      safetyProtocols: v.array(v.string()),
      isaArboristRequired: v.boolean()
    })),
    
    complexity: v.optional(v.object({
      level: v.string(),
      multiplier: v.number(),
      factors: v.array(v.string())
    })),
    
    // Status
    status: v.string(), // 'completed', 'error', 'pending'
    
    // Linked Records
    workOrderId: v.optional(v.id("workOrders")),
    leadId: v.optional(v.id("leads")),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
  .index("by_requestId", ["requestId"])
  .index("by_status", ["status"])
  .index("by_createdAt", ["createdAt"])
  .index("by_workOrder", ["workOrderId"]),

  // Business Intelligence Dashboard Data (like the project report analytics)
  businessReports: defineTable({
    reportType: v.string(), // 'daily_performance', 'weekly_summary', 'project_analysis', 'equipment_utilization'
    reportDate: v.number(),
    periodStart: v.number(),
    periodEnd: v.number(),
    
    // Performance Metrics
    metrics: v.object({
      totalRevenue: v.optional(v.number()),
      totalHours: v.optional(v.number()),
      averageHourlyRate: v.optional(v.number()),
      equipmentUtilization: v.optional(v.number()),
      crewEfficiency: v.optional(v.number()),
      customerSatisfaction: v.optional(v.number())
    }),
    
    // Variance Analysis (like project report shows contracted vs actual)
    varianceAnalysis: v.optional(v.object({
      budgetVariance: v.number(),
      timeVariance: v.number(),
      scopeVariance: v.number(),
      qualityVariance: v.number()
    })),
    
    // Key Insights (like "Lessons Learned & TreeAi Recommendations")
    insights: v.array(v.object({
      category: v.string(),
      insight: v.string(),
      recommendation: v.string(),
      priority: v.string()
    })),
    
    // Data Sources
    workOrdersAnalyzed: v.array(v.id("workOrders")),
    employeesIncluded: v.array(v.id("employees")),
    equipmentIncluded: v.array(v.id("equipment")),
    
    // Report Status
    status: v.string(), // 'generating', 'completed', 'error'
    generatedBy: v.string(), // 'alex_ai', 'system', 'user'
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
  .index("by_reportType", ["reportType"])
  .index("by_reportDate", ["reportDate"])
  .index("by_status", ["status"])
});