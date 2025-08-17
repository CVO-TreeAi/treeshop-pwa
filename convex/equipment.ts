import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all equipment
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("equipment").order("desc").collect();
  }
});

// Get available equipment
export const listAvailable = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("equipment")
      .withIndex("by_status", (q) => q.eq("status", "available"))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  }
});

// Get equipment by category
export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("equipment")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  }
});

// Get a single equipment item
export const get = query({
  args: { id: v.id("equipment") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  }
});

// Create new equipment
export const create = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    model: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    year: v.optional(v.number()),
    serialNumber: v.optional(v.string()),
    purchasePrice: v.optional(v.number()),
    currentValue: v.optional(v.number()),
    hourlyRate: v.number(),
    hourlyDepreciationRate: v.optional(v.number()),
    requiredForComplexity: v.array(v.string()),
    maxOperatingHours: v.optional(v.number()),
    currentHours: v.optional(v.number()),
    lastMaintenanceDate: v.optional(v.string()),
    nextMaintenanceHours: v.optional(v.number()),
    maintenanceCostPerHour: v.optional(v.number()),
    location: v.optional(v.string()),
    description: v.string(),
    operatingNotes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const equipmentId = await ctx.db.insert("equipment", {
      ...args,
      status: "available",
      isActive: true,
      createdAt: Date.now(),
      lastUpdated: Date.now()
    });
    return equipmentId;
  }
});

// Update equipment
export const update = mutation({
  args: {
    id: v.id("equipment"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    model: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    year: v.optional(v.number()),
    serialNumber: v.optional(v.string()),
    purchasePrice: v.optional(v.number()),
    currentValue: v.optional(v.number()),
    hourlyRate: v.optional(v.number()),
    hourlyDepreciationRate: v.optional(v.number()),
    requiredForComplexity: v.optional(v.array(v.string())),
    maxOperatingHours: v.optional(v.number()),
    currentHours: v.optional(v.number()),
    lastMaintenanceDate: v.optional(v.string()),
    nextMaintenanceHours: v.optional(v.number()),
    maintenanceCostPerHour: v.optional(v.number()),
    status: v.optional(v.string()),
    location: v.optional(v.string()),
    assignedToWorkOrderId: v.optional(v.string()),
    description: v.optional(v.string()),
    operatingNotes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      lastUpdated: Date.now()
    });
  }
});

// Assign equipment to work order
export const assignToWorkOrder = mutation({
  args: {
    equipmentId: v.id("equipment"),
    workOrderId: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.equipmentId, {
      status: "in_use",
      assignedToWorkOrderId: args.workOrderId,
      lastUpdated: Date.now()
    });
  }
});

// Return equipment from work order
export const returnFromWorkOrder = mutation({
  args: { equipmentId: v.id("equipment") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.equipmentId, {
      status: "available",
      assignedToWorkOrderId: undefined,
      lastUpdated: Date.now()
    });
  }
});

// Delete equipment (soft delete)
export const remove = mutation({
  args: { id: v.id("equipment") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
      lastUpdated: Date.now()
    });
  }
});