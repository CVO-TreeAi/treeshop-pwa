import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all work orders
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("workOrders").order("desc").collect();
  }
});

// Get work orders by status
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workOrders")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  }
});

// Get work orders by crew lead
export const listByCrewLead = query({
  args: { crewLeadId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workOrders")
      .withIndex("by_crew_lead", (q) => q.eq("crewLeadId", args.crewLeadId))
      .order("desc")
      .collect();
  }
});

// Get work orders by date range
export const listByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workOrders")
      .withIndex("by_scheduled_date")
      .filter((q) => 
        q.and(
          q.gte(q.field("scheduledDate"), args.startDate),
          q.lte(q.field("scheduledDate"), args.endDate)
        )
      )
      .collect();
  }
});

// Get a single work order
export const get = query({
  args: { id: v.id("workOrders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  }
});

// Create a new work order
export const create = mutation({
  args: {
    leadId: v.optional(v.string()),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    propertyAddress: v.string(),
    serviceType: v.string(),
    jobDescription: v.string(),
    scheduledDate: v.optional(v.number()),
    estimatedDuration: v.optional(v.number()),
    assignedCrew: v.array(v.string()),
    requiredEquipment: v.array(v.string()),
    crewLeadId: v.optional(v.string()),
    estimatedCost: v.number(),
    priority: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const workOrderNumber = `WO-${Date.now()}`;
    
    const workOrderId = await ctx.db.insert("workOrders", {
      ...args,
      workOrderNumber,
      status: "pending",
      priority: args.priority || "medium",
      createdAt: Date.now(),
      isActive: true
    });
    return workOrderId;
  }
});

// Update work order
export const update = mutation({
  args: {
    id: v.id("workOrders"),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    propertyAddress: v.optional(v.string()),
    serviceType: v.optional(v.string()),
    jobDescription: v.optional(v.string()),
    scheduledDate: v.optional(v.number()),
    estimatedDuration: v.optional(v.number()),
    actualStartTime: v.optional(v.number()),
    actualEndTime: v.optional(v.number()),
    assignedCrew: v.optional(v.array(v.string())),
    requiredEquipment: v.optional(v.array(v.string())),
    crewLeadId: v.optional(v.string()),
    estimatedCost: v.optional(v.number()),
    actualCost: v.optional(v.number()),
    laborHours: v.optional(v.number()),
    materialCosts: v.optional(v.number()),
    equipmentCosts: v.optional(v.number()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    completionNotes: v.optional(v.string()),
    customerSignature: v.optional(v.string()),
    photos: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      lastUpdated: Date.now()
    });
  }
});

// Add TreeScore calculation to work order
export const addTreeScoreCalculation = mutation({
  args: {
    workOrderId: v.id("workOrders"),
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
  },
  handler: async (ctx, args) => {
    const workOrder = await ctx.db.get(args.workOrderId);
    if (!workOrder) throw new Error("Work order not found");

    const existingCalculations = workOrder.treeScoreCalculations || [];
    
    // Remove existing calculation for this tree if it exists
    const filteredCalculations = existingCalculations.filter(
      calc => calc.treeId !== args.treeId
    );

    // Add new calculation
    const newCalculation = {
      treeId: args.treeId,
      measurements: args.measurements,
      hazardFactors: args.hazardFactors,
      results: args.results
    };

    const updatedCalculations = [...filteredCalculations, newCalculation];

    // Calculate total estimated cost from all trees
    const totalEstimatedCost = updatedCalculations.reduce(
      (sum, calc) => sum + calc.results.totalCost, 
      0
    );

    await ctx.db.patch(args.workOrderId, {
      treeScoreCalculations: updatedCalculations,
      estimatedCost: totalEstimatedCost,
      lastUpdated: Date.now()
    });
  }
});

// Start work order
export const startWork = mutation({
  args: { id: v.id("workOrders") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "in_progress",
      actualStartTime: Date.now(),
      lastUpdated: Date.now()
    });
  }
});

// Complete work order
export const completeWork = mutation({
  args: {
    id: v.id("workOrders"),
    completionNotes: v.optional(v.string()),
    customerSignature: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    actualCost: v.optional(v.number()),
    laborHours: v.optional(v.number()),
    materialCosts: v.optional(v.number()),
    equipmentCosts: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      status: "completed",
      actualEndTime: Date.now(),
      lastUpdated: Date.now()
    });
  }
});

// Delete work order (soft delete)
export const remove = mutation({
  args: { id: v.id("workOrders") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
      lastUpdated: Date.now()
    });
  }
});