import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all employees
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("employees").order("desc").collect();
  }
});

// Get active employees only
export const listActive = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("employees")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
  }
});

// Get employees by position
export const listByPosition = query({
  args: { position: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("employees")
      .withIndex("by_position", (q) => q.eq("position", args.position))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  }
});

// Get a single employee
export const get = query({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  }
});

// Create a new employee
export const create = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    employeeId: v.optional(v.string()),
    position: v.string(),
    skillLevel: v.string(),
    hireDate: v.optional(v.string()),
    employmentType: v.optional(v.string()),
    hourlyRate: v.number(),
    overtimeRate: v.optional(v.number()),
    skillPremium: v.optional(v.number()),
    certifications: v.array(v.string()),
    specialties: v.optional(v.array(v.string())),
    equipmentCertified: v.optional(v.array(v.string())),
    maxHoursPerWeek: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const employeeId = await ctx.db.insert("employees", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
      lastUpdated: Date.now()
    });
    return employeeId;
  }
});

// Update employee
export const update = mutation({
  args: {
    id: v.id("employees"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    employeeId: v.optional(v.string()),
    position: v.optional(v.string()),
    skillLevel: v.optional(v.string()),
    hireDate: v.optional(v.string()),
    employmentType: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    overtimeRate: v.optional(v.number()),
    skillPremium: v.optional(v.number()),
    certifications: v.optional(v.array(v.string())),
    specialties: v.optional(v.array(v.string())),
    equipmentCertified: v.optional(v.array(v.string())),
    maxHoursPerWeek: v.optional(v.number()),
    performanceMetrics: v.optional(v.object({
      totalHours: v.number(),
      avgEfficiency: v.number(),
      safetyScore: v.number(),
      qualityRating: v.number(),
      customerSatisfaction: v.number()
    }))
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      lastUpdated: Date.now()
    });
  }
});

// Deactivate employee (soft delete)
export const deactivate = mutation({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
      lastUpdated: Date.now()
    });
  }
});