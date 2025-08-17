import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all leads
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("leads").order("desc").collect();
  }
});

// Get leads by status
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  }
});

// Get a single lead
export const get = query({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  }
});

// Create a new lead
export const create = mutation({
  args: {
    customerName: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    company: v.optional(v.string()),
    propertyAddress: v.string(),
    serviceType: v.string(),
    urgencyLevel: v.string(),
    leadSource: v.string(),
    estimatedTreeCount: v.number(),
    estimatedProjectValue: v.string(),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    followUpDate: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const leadId = await ctx.db.insert("leads", {
      ...args,
      status: args.status || "new",
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      isActive: true
    });
    return leadId;
  }
});

// Update a lead
export const update = mutation({
  args: {
    id: v.id("leads"),
    customerName: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    company: v.optional(v.string()),
    propertyAddress: v.optional(v.string()),
    serviceType: v.optional(v.string()),
    urgencyLevel: v.optional(v.string()),
    leadSource: v.optional(v.string()),
    estimatedTreeCount: v.optional(v.number()),
    estimatedProjectValue: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
    qualificationScore: v.optional(v.number()),
    assignedTo: v.optional(v.string()),
    followUpDate: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      lastUpdated: Date.now()
    });
  }
});

// Delete a lead (soft delete)
export const remove = mutation({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
      lastUpdated: Date.now()
    });
  }
});

// Convert lead to work order
export const convertToWorkOrder = mutation({
  args: {
    leadId: v.id("leads"),
    scheduledDate: v.optional(v.number()),
    estimatedDuration: v.optional(v.number()),
    assignedCrew: v.array(v.string()),
    requiredEquipment: v.array(v.string())
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");

    // Generate work order number
    const workOrderNumber = `WO-${Date.now()}`;

    // Create work order
    const workOrderId = await ctx.db.insert("workOrders", {
      leadId: args.leadId,
      workOrderNumber,
      customerName: lead.customerName,
      customerPhone: lead.phone,
      customerEmail: lead.email,
      propertyAddress: lead.propertyAddress,
      serviceType: lead.serviceType,
      jobDescription: lead.notes || `${lead.serviceType} service for ${lead.estimatedTreeCount} trees`,
      scheduledDate: args.scheduledDate,
      estimatedDuration: args.estimatedDuration,
      assignedCrew: args.assignedCrew,
      requiredEquipment: args.requiredEquipment,
      estimatedCost: 0, // Will be calculated with TreeScore
      status: "pending",
      priority: lead.urgencyLevel === "emergency" ? "emergency" : "medium",
      createdAt: Date.now(),
      isActive: true
    });

    // Update lead status
    await ctx.db.patch(args.leadId, {
      status: "won",
      lastUpdated: Date.now()
    });

    return workOrderId;
  }
});