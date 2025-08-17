import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Upload a photo and return the storage ID
export const uploadPhoto = mutation({
  args: {
    data: v.bytes(),
    filename: v.string(),
    contentType: v.string(),
    entityType: v.string(), // 'work_order', 'equipment', 'lead', 'employee'
    entityId: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()) // 'before', 'during', 'after', 'damage', 'equipment'
  },
  handler: async (ctx, args) => {
    // Store the file
    const storageId = await ctx.storage.store(args.data);
    
    // Create photo record
    const photoId = await ctx.db.insert("photos", {
      storageId,
      filename: args.filename,
      contentType: args.contentType,
      entityType: args.entityType,
      entityId: args.entityId,
      description: args.description,
      category: args.category,
      uploadedAt: Date.now(),
      isActive: true
    });

    return { photoId, storageId, url: await ctx.storage.getUrl(storageId) };
  },
});

// Get photos for a specific entity
export const getPhotosForEntity = query({
  args: {
    entityType: v.string(),
    entityId: v.string(),
    category: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let photos = await ctx.db
      .query("photos")
      .withIndex("by_entity", (q) => 
        q.eq("entityType", args.entityType).eq("entityId", args.entityId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (args.category) {
      photos = photos.filter(photo => photo.category === args.category);
    }

    // Get URLs for all photos
    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => ({
        ...photo,
        url: await ctx.storage.getUrl(photo.storageId)
      }))
    );

    return photosWithUrls;
  },
});

// Delete a photo
export const deletePhoto = mutation({
  args: { photoId: v.id("photos") },
  handler: async (ctx, args) => {
    const photo = await ctx.db.get(args.photoId);
    if (!photo) throw new Error("Photo not found");

    // Delete from storage
    await ctx.storage.delete(photo.storageId);
    
    // Soft delete from database
    await ctx.db.patch(args.photoId, {
      isActive: false,
      deletedAt: Date.now()
    });
  },
});

// Update photo details
export const updatePhoto = mutation({
  args: {
    photoId: v.id("photos"),
    description: v.optional(v.string()),
    category: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { photoId, ...updates } = args;
    await ctx.db.patch(photoId, {
      ...updates,
      updatedAt: Date.now()
    });
  },
});

// Get all photos (for admin)
export const getAllPhotos = query({
  args: {
    limit: v.optional(v.number()),
    entityType: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("photos")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc");

    if (args.entityType) {
      query = query.filter((q) => q.eq(q.field("entityType"), args.entityType));
    }

    const photos = await query.take(args.limit || 50);

    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => ({
        ...photo,
        url: await ctx.storage.getUrl(photo.storageId)
      }))
    );

    return photosWithUrls;
  },
});