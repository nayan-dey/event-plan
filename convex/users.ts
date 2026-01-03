import { v } from "convex/values";
import { internalMutation, mutation, query, QueryCtx } from "./_generated/server";

// ============ Queries ============

// Get current user
export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

// Get user by ID
export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

// ============ Mutations ============

// Update user profile (age, gender, phone)
export const updateProfile = mutation({
  args: {
    age: v.optional(v.number()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      ...(args.age !== undefined && { age: args.age }),
      ...(args.gender !== undefined && { gender: args.gender }),
      ...(args.phone !== undefined && { phone: args.phone }),
    });

    return user._id;
  },
});

// ============ Internal (Webhook) ============

// Helper: Get user by Clerk ID
async function getUserByClerkId(ctx: QueryCtx, clerkId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();
}

// Upsert user from Clerk webhook
export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await getUserByClerkId(ctx, args.clerkId);

    if (existingUser) {
      // Update existing user (only Clerk fields)
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
      });
      return existingUser._id;
    } else {
      // Create new user with default role
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
        role: "participant",
      });
      return userId;
    }
  },
});

// Delete user from Clerk webhook
export const deleteFromClerk = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await getUserByClerkId(ctx, clerkId);

    if (user) {
      await ctx.db.delete(user._id);
      return true;
    }

    console.warn(`Can't delete user, none found with clerkId: ${clerkId}`);
    return false;
  },
});