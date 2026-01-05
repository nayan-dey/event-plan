import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============ Queries ============

// Get current user's registrations
export const myRegistrations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Fetch program details for each registration
    const withPrograms = await Promise.all(
      registrations.map(async (reg) => {
        const program = await ctx.db.get(reg.programId);
        return { ...reg, program };
      })
    );

    return withPrograms.filter((r) => r.status !== "cancelled");
  },
});

// Get registration for specific program
export const getForProgram = query({
  args: { programId: v.id("programs") },
  handler: async (ctx, { programId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    return await ctx.db
      .query("registrations")
      .withIndex("by_user_program", (q) => 
        q.eq("userId", user._id).eq("programId", programId)
      )
      .first();
  },
});

// Get all registrations for a program (admin)
export const listByProgram = query({
  args: { programId: v.id("programs") },
  handler: async (ctx, { programId }) => {
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_program", (q) => q.eq("programId", programId))
      .collect();

    // Fetch user details
    const withUsers = await Promise.all(
      registrations.map(async (reg) => {
        const user = await ctx.db.get(reg.userId);
        return { ...reg, user };
      })
    );

    return withUsers;
  },
});

// ============ Mutations ============

// Register for an individual event
export const register = mutation({
  args: {
    programId: v.id("programs"),
    songLink: v.optional(v.string()),
    songTitle: v.optional(v.string()),
  },
  handler: async (ctx, { programId, songLink, songTitle }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");
    if (!user.age || !user.gender) {
      throw new Error("Please complete your profile first");
    }

    const program = await ctx.db.get(programId);
    if (!program) throw new Error("Program not found");
    if (!program.isOpen) throw new Error("Registration closed");
    if (program.isTeamEvent) throw new Error("This is a team event. Create or join a team instead.");

    // Check eligibility
    if (program.gender !== "all") {
      if (program.gender === "male" && user.gender !== "male") {
        throw new Error("This event is for men only");
      }
      if (program.gender === "female" && user.gender !== "female") {
        throw new Error("This event is for women only");
      }
    }

    if (program.minAge && user.age < program.minAge) {
      throw new Error(`Minimum age is ${program.minAge}`);
    }
    if (program.maxAge && user.age > program.maxAge) {
      throw new Error(`Maximum age is ${program.maxAge}`);
    }

    // Check for song link requirement
    if (program.requiresSongLink && !songLink) {
      throw new Error("Please provide a song link (YouTube or Spotify)");
    }

    // Check if already registered
    const existing = await ctx.db
      .query("registrations")
      .withIndex("by_user_program", (q) => 
        q.eq("userId", user._id).eq("programId", programId)
      )
      .first();

    if (existing && existing.status !== "cancelled") {
      throw new Error("Already registered for this event");
    }

    // Create registration
    const registrationId = await ctx.db.insert("registrations", {
      userId: user._id,
      programId,
      status: "registered",
      songLink,
      songTitle,
      registeredAt: Date.now(),
    });

    return registrationId;
  },
});

// Cancel registration
export const cancel = mutation({
  args: { registrationId: v.id("registrations") },
  handler: async (ctx, { registrationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const registration = await ctx.db.get(registrationId);
    if (!registration) throw new Error("Registration not found");
    if (registration.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(registrationId, { status: "cancelled" });
    return true;
  },
});

// Update song link
export const updateSongLink = mutation({
  args: {
    registrationId: v.id("registrations"),
    songLink: v.string(),
    songTitle: v.optional(v.string()),
  },
  handler: async (ctx, { registrationId, songLink, songTitle }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const registration = await ctx.db.get(registrationId);
    if (!registration) throw new Error("Registration not found");
    if (registration.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(registrationId, { songLink, songTitle });
    return true;
  },
});