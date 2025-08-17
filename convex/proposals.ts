import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all proposals with optional filtering
export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("proposals").filter((q) => q.eq(q.field("isActive"), true));
    
    if (args.status && args.status !== 'all') {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    return await query.order("desc").collect();
  },
});

// Get a specific proposal by ID
export const get = query({
  args: { proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.proposalId);
  },
});

// Create a new proposal
export const create = mutation({
  args: {
    leadId: v.optional(v.id("leads")),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    propertyAddress: v.string(),
    lineItems: v.array(v.object({
      id: v.string(),
      description: v.string(),
      quantity: v.number(),
      unit: v.string(),
      unitPrice: v.number(),
      totalPrice: v.number(),
      treeScoreData: v.optional(v.object({
        height: v.number(),
        canopyRadius: v.number(),
        dbh: v.number(),
        baseScore: v.number(),
        riskMultiplier: v.number(),
        finalScore: v.number(),
        businessRulesApplied: v.array(v.string())
      })),
      equipmentRequired: v.array(v.string()),
      laborHours: v.number(),
      complexity: v.string(),
      laborCost: v.optional(v.number()),
      equipmentCost: v.optional(v.number()),
      materialCost: v.optional(v.number()),
      overheadCost: v.optional(v.number()),
      profitMargin: v.optional(v.number()),
      afissFactors: v.optional(v.object({
        accessScore: v.number(),
        fallZoneScore: v.number(),
        interferenceScore: v.number(),
        severityScore: v.number(),
        siteConditionsScore: v.number(),
        compositeScore: v.number()
      })),
      isaArboristRequired: v.boolean(),
      specialCertificationsRequired: v.array(v.string()),
      serviceCategory: v.string(),
      urgencyLevel: v.optional(v.string()),
      seasonalFactors: v.optional(v.array(v.string())),
      permitsRequired: v.optional(v.array(v.string()))
    })),
    subtotal: v.number(),
    taxRate: v.number(),
    taxAmount: v.number(),
    totalAmount: v.number(),
    validUntil: v.number(),
    notes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const proposalNumber = `PROP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const proposalId = await ctx.db.insert("proposals", {
      proposalNumber,
      leadId: args.leadId,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      propertyAddress: args.propertyAddress,
      status: "draft",
      lineItems: args.lineItems,
      subtotal: args.subtotal,
      taxRate: args.taxRate,
      taxAmount: args.taxAmount,
      totalAmount: args.totalAmount,
      validUntil: args.validUntil,
      notes: args.notes,
      version: 1,
      createdAt: Date.now(),
      isActive: true
    });
    
    return { success: true, proposalId };
  },
});

// Send a proposal to the customer
export const send = mutation({
  args: { proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) {
      throw new Error("Proposal not found");
    }
    
    await ctx.db.patch(args.proposalId, {
      status: "sent",
      sentAt: Date.now(),
      lastUpdated: Date.now()
    });
    
    return { success: true };
  },
});

// Mark proposal as viewed (when customer opens it)
export const markViewed = mutation({
  args: { proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) {
      throw new Error("Proposal not found");
    }
    
    await ctx.db.patch(args.proposalId, {
      status: "viewed",
      viewedAt: Date.now(),
      lastUpdated: Date.now()
    });
    
    return { success: true };
  },
});

// Accept proposal and create work order
export const accept = mutation({
  args: { proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) {
      throw new Error("Proposal not found");
    }
    
    // Create work order from proposal
    const workOrderNumber = `WO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const workOrderId = await ctx.db.insert("workOrders", {
      leadId: proposal.leadId,
      workOrderNumber,
      customerName: proposal.customerName,
      customerPhone: proposal.customerPhone,
      customerEmail: proposal.customerEmail,
      propertyAddress: proposal.propertyAddress,
      serviceType: proposal.lineItems[0]?.serviceCategory || "tree_service",
      jobDescription: proposal.lineItems.map(item => item.description).join("; "),
      estimatedCost: proposal.totalAmount,
      assignedCrew: [],
      requiredEquipment: [],
      status: "pending",
      priority: "medium",
      createdAt: Date.now(),
      isActive: true
    });
    
    // Update proposal status
    await ctx.db.patch(args.proposalId, {
      status: "approved",
      respondedAt: Date.now(),
      workOrderId: workOrderId,
      conversionDate: Date.now(),
      lastUpdated: Date.now()
    });
    
    return { success: true, workOrderId };
  },
});

// Reject proposal
export const reject = mutation({
  args: { 
    proposalId: v.id("proposals"),
    reason: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) {
      throw new Error("Proposal not found");
    }
    
    await ctx.db.patch(args.proposalId, {
      status: "rejected",
      respondedAt: Date.now(),
      notes: args.reason ? `${proposal.notes || ""}\n\nRejection reason: ${args.reason}`.trim() : proposal.notes,
      lastUpdated: Date.now()
    });
    
    return { success: true };
  },
});

// Update proposal
export const update = mutation({
  args: {
    proposalId: v.id("proposals"),
    updates: v.object({
      customerName: v.optional(v.string()),
      customerEmail: v.optional(v.string()),
      customerPhone: v.optional(v.string()),
      propertyAddress: v.optional(v.string()),
      lineItems: v.optional(v.array(v.any())),
      subtotal: v.optional(v.number()),
      taxRate: v.optional(v.number()),
      taxAmount: v.optional(v.number()),
      totalAmount: v.optional(v.number()),
      validUntil: v.optional(v.number()),
      notes: v.optional(v.string())
    })
  },
  handler: async (ctx, args) => {
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) {
      throw new Error("Proposal not found");
    }
    
    await ctx.db.patch(args.proposalId, {
      ...args.updates,
      lastUpdated: Date.now()
    });
    
    return { success: true };
  },
});

// Duplicate proposal
export const duplicate = mutation({
  args: { proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const originalProposal = await ctx.db.get(args.proposalId);
    if (!originalProposal) {
      throw new Error("Original proposal not found");
    }
    
    const proposalNumber = `PROP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const newProposalId = await ctx.db.insert("proposals", {
      ...originalProposal,
      _id: undefined,
      _creationTime: undefined,
      proposalNumber,
      status: "draft",
      sentAt: undefined,
      viewedAt: undefined,
      respondedAt: undefined,
      workOrderId: undefined,
      conversionDate: undefined,
      parentProposalId: args.proposalId,
      revisionReason: "Duplicated proposal",
      version: 1,
      createdAt: Date.now(),
      lastUpdated: undefined
    });
    
    return { success: true, proposalId: newProposalId };
  },
});

// Get proposals by customer
export const getByCustomer = query({
  args: { customerName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("proposals")
      .filter((q) => q.eq(q.field("customerName"), args.customerName))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
  },
});

// Get proposals expiring soon
export const getExpiringSoon = query({
  args: { daysAhead: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const daysAhead = args.daysAhead || 7;
    const cutoffDate = Date.now() + (daysAhead * 24 * 60 * 60 * 1000);
    
    return await ctx.db
      .query("proposals")
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.or(
        q.eq(q.field("status"), "sent"),
        q.eq(q.field("status"), "viewed")
      ))
      .filter((q) => q.lte(q.field("validUntil"), cutoffDate))
      .order("asc")
      .collect();
  },
});