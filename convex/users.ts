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

// Check if profile is complete
export const isProfileComplete = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return false;

    return !!(user.age && user.gender && user.phone);
  },
});

// ============ Mutations ============

// Update user profile (age, gender, phone, dateOfBirth)
export const updateProfile = mutation({
  args: {
    dateOfBirth: v.optional(v.string()),
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

    // Calculate age from dateOfBirth if provided
    let calculatedAge = args.age;
    if (args.dateOfBirth) {
      const birthDate = new Date(args.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      calculatedAge = age;
    }

    const updates: Record<string, any> = {};
    
    if (args.dateOfBirth !== undefined) updates.dateOfBirth = args.dateOfBirth;
    if (calculatedAge !== undefined) updates.age = calculatedAge;
    if (args.gender !== undefined) updates.gender = args.gender;
    if (args.phone !== undefined) updates.phone = args.phone;

    // Check if profile is now complete
    const newAge = updates.age ?? user.age;
    const newGender = updates.gender ?? user.gender;
    const newPhone = updates.phone ?? user.phone;
    updates.isProfileComplete = !!(newAge && newGender && newPhone);

    await ctx.db.patch(user._id, updates);

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
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      imageUrl: args.imageUrl,
      role: "participant",
      isProfileComplete: false,
    });
  },
});

// Delete user from Clerk webhook
export const deleteFromClerk = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await getUserByClerkId(ctx, clerkId);
    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});