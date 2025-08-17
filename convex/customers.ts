import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Property Intelligence Schema
const propertyIntelligenceSchema = v.object({
  // Physical Characteristics
  lotSize: v.optional(v.string()),
  topology: v.optional(v.union(v.literal("flat"), v.literal("sloped"), v.literal("steep"), v.literal("irregular"))),
  soilType: v.optional(v.union(v.literal("clay"), v.literal("sandy"), v.literal("rocky"), v.literal("mixed"), v.literal("sandy loam"))),
  drainage: v.optional(v.union(v.literal("poor"), v.literal("fair"), v.literal("good"), v.literal("excellent"))),
  
  // Access & Logistics
  accessChallenges: v.optional(v.array(v.string())),
  utilityLines: v.optional(v.object({
    overhead: v.optional(v.array(v.string())),
    underground: v.optional(v.array(v.string()))
  })),
  
  // Aerial Analysis
  aerialHistory: v.optional(v.array(v.object({
    year: v.number(),
    changes: v.string()
  })))
});

// Tree Inventory Schema
const treeInventorySchema = v.object({
  id: v.string(),
  species: v.string(),
  age: v.optional(v.string()),
  health: v.union(v.literal("poor"), v.literal("fair"), v.literal("good"), v.literal("excellent")),
  dbh: v.optional(v.number()),
  height: v.optional(v.number()),
  treeScore: v.optional(v.number()),
  riskFactors: v.optional(v.array(v.string())),
  lastPruned: v.optional(v.string()),
  nextService: v.optional(v.string()),
  location: v.optional(v.string()),
  notes: v.optional(v.string()),
  photos: v.optional(v.array(v.string()))
});

// Financial Intelligence Schema
const financialIntelligenceSchema = v.object({
  paymentPatterns: v.optional(v.object({
    averagePayTime: v.optional(v.number()),
    paymentReliability: v.optional(v.union(v.literal("poor"), v.literal("fair"), v.literal("good"), v.literal("excellent"))),
    preferredPaymentMethod: v.optional(v.string())
  })),
  spendingCapacity: v.optional(v.object({
    propertyValue: v.optional(v.number()),
    estimatedIncome: v.optional(v.string()),
    spendingTier: v.optional(v.union(v.literal("budget"), v.literal("standard"), v.literal("premium"), v.literal("luxury"))),
    priceSensitivity: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low")))
  })),
  referralValue: v.optional(v.object({
    customersReferred: v.optional(v.number()),
    referralRevenue: v.optional(v.number()),
    influenceScore: v.optional(v.number())
  }))
});

// Communication Intelligence Schema
const communicationIntelligenceSchema = v.object({
  preferences: v.optional(v.object({
    contactMethod: v.optional(v.union(v.literal("call"), v.literal("email"), v.literal("text"))),
    bestTimeToCall: v.optional(v.string()),
    responseTime: v.optional(v.string()),
    informationStyle: v.optional(v.union(v.literal("summary"), v.literal("standard"), v.literal("detailed")))
  })),
  decisionMaking: v.optional(v.object({
    speed: v.optional(v.union(v.literal("quick"), v.literal("standard"), v.literal("deliberate"))),
    involvedParties: v.optional(v.array(v.string())),
    influenceFactors: v.optional(v.array(v.string())),
    trustBuilders: v.optional(v.array(v.string()))
  }))
});

// Service History Schema
const serviceHistorySchema = v.object({
  id: v.string(),
  date: v.string(),
  services: v.array(v.string()),
  crew: v.optional(v.string()),
  equipment: v.optional(v.array(v.string())),
  cost: v.optional(v.number()),
  duration: v.optional(v.number()),
  satisfaction: v.optional(v.number()),
  photos: v.optional(v.array(v.string())),
  treeScores: v.optional(v.array(v.object({
    treeId: v.string(),
    before: v.optional(v.number()),
    after: v.optional(v.number())
  }))),
  notes: v.optional(v.string()),
  workOrderId: v.optional(v.string())
});

// Risk Assessment Schema
const riskAssessmentSchema = v.object({
  liabilityRisks: v.optional(v.object({
    propertyRisks: v.optional(v.array(v.string())),
    insuranceAdequacy: v.optional(v.union(v.literal("poor"), v.literal("fair"), v.literal("good"), v.literal("excellent"))),
    specialRequirements: v.optional(v.array(v.string()))
  })),
  customerBehavior: v.optional(v.object({
    safetyConsciousness: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    riskTolerance: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    supervision: v.optional(v.string())
  })),
  paymentRisk: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  accessRisk: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  logisticsComplexity: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high")))
});

// Main Customer Schema
export const customerSchema = v.object({
  // Basic Information
  customerName: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  company: v.optional(v.string()),
  
  // Property Information
  propertyAddress: v.string(),
  propertyCoordinates: v.optional(v.object({
    lat: v.number(),
    lng: v.number()
  })),
  
  // Intelligence Systems
  propertyIntelligence: v.optional(propertyIntelligenceSchema),
  treeInventory: v.optional(v.array(treeInventorySchema)),
  financialIntelligence: v.optional(financialIntelligenceSchema),
  communicationIntelligence: v.optional(communicationIntelligenceSchema),
  serviceHistory: v.optional(v.array(serviceHistorySchema)),
  riskAssessment: v.optional(riskAssessmentSchema),
  
  // Predictive Intelligence
  predictiveIntelligence: v.optional(v.object({
    nextServicePredicted: v.optional(v.object({
      service: v.string(),
      timeframe: v.string(),
      confidence: v.number(),
      reasoning: v.string()
    })),
    seasonalCycle: v.optional(v.object({
      spring: v.optional(v.array(v.string())),
      summer: v.optional(v.array(v.string())),
      fall: v.optional(v.array(v.string())),
      winter: v.optional(v.array(v.string()))
    })),
    stormRisk: v.optional(v.object({
      vulnerability: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      weakTrees: v.optional(v.array(v.string())),
      preparedness: v.optional(v.string())
    })),
    budgetCycle: v.optional(v.object({
      peakSpendingMonths: v.optional(v.array(v.string())),
      averageAnnualSpend: v.optional(v.number()),
      largeProjectTiming: v.optional(v.string())
    }))
  })),
  
  // Relationship Mapping
  relationshipMapping: v.optional(v.object({
    familyConnections: v.optional(v.array(v.object({
      name: v.string(),
      relationship: v.string(),
      address: v.optional(v.string())
    }))),
    neighborConnections: v.optional(v.array(v.object({
      address: v.string(),
      sharedTrees: v.optional(v.boolean()),
      relationship: v.optional(v.string())
    }))),
    referralNetwork: v.optional(v.array(v.object({
      name: v.string(),
      relationship: v.string(),
      status: v.optional(v.string())
    }))),
    communityInvolvement: v.optional(v.object({
      hoa: v.optional(v.boolean()),
      localInfluence: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
      reputationMatters: v.optional(v.boolean())
    }))
  })),
  
  // AI Insights
  aiInsights: v.optional(v.object({
    nextOpportunity: v.optional(v.object({
      service: v.string(),
      probability: v.number(),
      timing: v.string(),
      approach: v.string()
    })),
    upsellOpportunities: v.optional(v.array(v.string())),
    retentionRisk: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    lifetimeValue: v.optional(v.number()),
    smartAlerts: v.optional(v.array(v.string()))
  })),
  
  // Evolution Tracking
  evolutionTracking: v.optional(v.object({
    landscapeChanges: v.optional(v.array(v.object({
      date: v.string(),
      change: v.string(),
      impact: v.optional(v.string())
    }))),
    infrastructureUpdates: v.optional(v.array(v.object({
      date: v.string(),
      change: v.string(),
      impact: v.optional(v.string())
    }))),
    neighborhoodDevelopment: v.optional(v.object({
      newConstruction: v.optional(v.string()),
      treeRemovalTrends: v.optional(v.string()),
      serviceOpportunities: v.optional(v.string())
    }))
  })),
  
  // Status and Tracking
  status: v.optional(v.union(
    v.literal("active"),
    v.literal("inactive"),
    v.literal("prospective"),
    v.literal("blacklisted")
  )),
  tags: v.optional(v.array(v.string())),
  priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("vip"))),
  
  // System Fields
  createdAt: v.optional(v.string()),
  updatedAt: v.optional(v.string()),
  createdBy: v.optional(v.string()),
  assignedTo: v.optional(v.string()),
  isActive: v.optional(v.boolean())
});

// Queries
export const list = query({
  args: {},
  handler: async (ctx) => {
    const customers = await ctx.db
      .query("customers")
      .filter((q) => q.neq(q.field("isActive"), false))
      .order("desc")
      .collect();
    
    return customers;
  },
});

export const getById = query({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const search = query({
  args: { 
    searchTerm: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let customers = await ctx.db
      .query("customers")
      .filter((q) => q.neq(q.field("isActive"), false))
      .collect();

    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      customers = customers.filter(customer => 
        customer.customerName?.toLowerCase().includes(term) ||
        customer.email?.toLowerCase().includes(term) ||
        customer.phone?.includes(term) ||
        customer.propertyAddress?.toLowerCase().includes(term)
      );
    }

    if (args.status) {
      customers = customers.filter(customer => customer.status === args.status);
    }

    if (args.priority) {
      customers = customers.filter(customer => customer.priority === args.priority);
    }

    return customers;
  },
});

// Mutations
export const create = mutation({
  args: customerSchema,
  handler: async (ctx, args) => {
    const customerId = await ctx.db.insert("customers", {
      ...args,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      status: args.status || "active"
    });
    
    return customerId;
  },
});

export const update = mutation({
  args: { 
    id: v.id("customers"), 
    ...customerSchema 
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    
    return id;
  },
});

export const addTreeToInventory = mutation({
  args: {
    customerId: v.id("customers"),
    tree: treeInventorySchema
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);
    if (!customer) throw new Error("Customer not found");

    const currentInventory = customer.treeInventory || [];
    const updatedInventory = [...currentInventory, args.tree];

    await ctx.db.patch(args.customerId, {
      treeInventory: updatedInventory,
      updatedAt: new Date().toISOString()
    });

    return args.customerId;
  },
});

export const addServiceHistory = mutation({
  args: {
    customerId: v.id("customers"),
    service: serviceHistorySchema
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);
    if (!customer) throw new Error("Customer not found");

    const currentHistory = customer.serviceHistory || [];
    const updatedHistory = [...currentHistory, args.service];

    await ctx.db.patch(args.customerId, {
      serviceHistory: updatedHistory,
      updatedAt: new Date().toISOString()
    });

    return args.customerId;
  },
});

export const updatePredictiveIntelligence = mutation({
  args: {
    customerId: v.id("customers"),
    predictions: v.object({
      nextServicePredicted: v.optional(v.object({
        service: v.string(),
        timeframe: v.string(),
        confidence: v.number(),
        reasoning: v.string()
      })),
      seasonalCycle: v.optional(v.object({
        spring: v.optional(v.array(v.string())),
        summer: v.optional(v.array(v.string())),
        fall: v.optional(v.array(v.string())),
        winter: v.optional(v.array(v.string()))
      }))
    })
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);
    if (!customer) throw new Error("Customer not found");

    await ctx.db.patch(args.customerId, {
      predictiveIntelligence: {
        ...customer.predictiveIntelligence,
        ...args.predictions
      },
      updatedAt: new Date().toISOString()
    });

    return args.customerId;
  },
});

export const remove = mutation({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { 
      isActive: false,
      updatedAt: new Date().toISOString()
    });
    return args.id;
  },
});