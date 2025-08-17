import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all invoices
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("invoices").order("desc").collect();
  }
});

// Get invoices by payment status
export const listByStatus = query({
  args: { paymentStatus: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invoices")
      .withIndex("by_status", (q) => q.eq("paymentStatus", args.paymentStatus))
      .order("desc")
      .collect();
  }
});

// Get invoices by customer
export const listByCustomer = query({
  args: { customerName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invoices")
      .withIndex("by_customer", (q) => q.eq("customerName", args.customerName))
      .order("desc")
      .collect();
  }
});

// Get overdue invoices
export const listOverdue = query({
  handler: async (ctx) => {
    const now = Date.now();
    return await ctx.db
      .query("invoices")
      .withIndex("by_due_date")
      .filter((q) => 
        q.and(
          q.lt(q.field("dueDate"), now),
          q.neq(q.field("paymentStatus"), "paid")
        )
      )
      .collect();
  }
});

// Get a single invoice
export const get = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  }
});

// Create a new invoice
export const create = mutation({
  args: {
    workOrderId: v.optional(v.string()),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    billingAddress: v.string(),
    serviceDate: v.optional(v.number()),
    lineItems: v.array(v.object({
      description: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      totalPrice: v.number(),
      treeScoreId: v.optional(v.string())
    })),
    taxRate: v.optional(v.number()),
    notes: v.optional(v.string()),
    terms: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;
    
    // Calculate totals
    const subtotal = args.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = args.taxRate ? subtotal * (args.taxRate / 100) : 0;
    const totalAmount = subtotal + taxAmount;
    
    // Set due date (30 days from issue)
    const issueDate = Date.now();
    const dueDate = issueDate + (30 * 24 * 60 * 60 * 1000);

    const invoiceId = await ctx.db.insert("invoices", {
      ...args,
      invoiceNumber,
      issueDate,
      dueDate,
      subtotal,
      taxAmount,
      totalAmount,
      balance: totalAmount,
      paymentStatus: "pending",
      createdAt: Date.now(),
      isActive: true
    });
    return invoiceId;
  }
});

// Create invoice from work order
export const createFromWorkOrder = mutation({
  args: { workOrderId: v.id("workOrders") },
  handler: async (ctx, args) => {
    const workOrder = await ctx.db.get(args.workOrderId);
    if (!workOrder) throw new Error("Work order not found");

    const lineItems = [];
    
    // Add line items from TreeScore calculations
    if (workOrder.treeScoreCalculations) {
      for (const calc of workOrder.treeScoreCalculations) {
        lineItems.push({
          description: `Tree removal - ${calc.measurements.species || 'Unknown species'} (${calc.measurements.height}ft H x ${calc.measurements.dbh}in DBH)`,
          quantity: 1,
          unitPrice: calc.results.totalCost,
          totalPrice: calc.results.totalCost,
          treeScoreId: calc.treeId
        });
      }
    }

    // Add general service line item if no TreeScore calculations
    if (lineItems.length === 0) {
      lineItems.push({
        description: workOrder.jobDescription,
        quantity: 1,
        unitPrice: workOrder.actualCost || workOrder.estimatedCost,
        totalPrice: workOrder.actualCost || workOrder.estimatedCost
      });
    }

    const invoiceNumber = `INV-${Date.now()}`;
    const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxRate = 8.5; // Default tax rate
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;
    
    const issueDate = Date.now();
    const dueDate = issueDate + (30 * 24 * 60 * 60 * 1000);

    const invoiceId = await ctx.db.insert("invoices", {
      workOrderId: args.workOrderId,
      invoiceNumber,
      customerName: workOrder.customerName,
      customerEmail: workOrder.customerEmail,
      customerPhone: workOrder.customerPhone,
      billingAddress: workOrder.propertyAddress,
      issueDate,
      dueDate,
      serviceDate: workOrder.scheduledDate,
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      balance: totalAmount,
      paymentStatus: "pending",
      terms: "Payment due within 30 days",
      createdAt: Date.now(),
      isActive: true
    });

    return invoiceId;
  }
});

// Update invoice
export const update = mutation({
  args: {
    id: v.id("invoices"),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    billingAddress: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    serviceDate: v.optional(v.number()),
    paymentStatus: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    paymentDate: v.optional(v.number()),
    amountPaid: v.optional(v.number()),
    notes: v.optional(v.string()),
    terms: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Recalculate balance if payment amount changes
    if (updates.amountPaid !== undefined) {
      const invoice = await ctx.db.get(id);
      if (invoice) {
        updates.balance = invoice.totalAmount - updates.amountPaid;
        
        // Update payment status based on balance
        if (updates.balance <= 0) {
          updates.paymentStatus = "paid";
        } else if (updates.amountPaid > 0) {
          updates.paymentStatus = "partial";
        }
      }
    }

    await ctx.db.patch(id, updates);
  }
});

// Record payment
export const recordPayment = mutation({
  args: {
    invoiceId: v.id("invoices"),
    amount: v.number(),
    paymentMethod: v.string(),
    paymentDate: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice) throw new Error("Invoice not found");

    const newAmountPaid = (invoice.amountPaid || 0) + args.amount;
    const newBalance = invoice.totalAmount - newAmountPaid;
    
    let paymentStatus = "partial";
    if (newBalance <= 0) {
      paymentStatus = "paid";
    }

    await ctx.db.patch(args.invoiceId, {
      amountPaid: newAmountPaid,
      balance: newBalance,
      paymentStatus,
      paymentMethod: args.paymentMethod,
      paymentDate: args.paymentDate || Date.now()
    });
  }
});

// Delete invoice (soft delete)
export const remove = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false
    });
  }
});