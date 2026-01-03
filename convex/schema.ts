import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - synced from Clerk + profile data
  users: defineTable({
    // From Clerk (synced via webhook)
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    imageUrl: v.optional(v.string()),
    
    // Profile data (user fills in app)
    age: v.optional(v.number()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    phone: v.optional(v.string()),
    
    // Role
    role: v.optional(v.union(v.literal("participant"), v.literal("admin"), v.literal("judge"))),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Programs table
  programs: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    rules: v.optional(v.string()),
    day: v.number(), // 1, 2, 3, 4
    time: v.string(), // e.g., "10:00 AM"
    venue: v.optional(v.string()),
    category: v.union(
      v.literal("music"),
      v.literal("sports"),
      v.literal("art"),
      v.literal("dance"),
      v.literal("other")
    ),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("mixed")),
    minAge: v.optional(v.number()),
    maxAge: v.optional(v.number()),
    maxParticipants: v.optional(v.number()),
    isOpen: v.boolean(), // registration open or closed
  })
    .index("by_day", ["day"])
    .index("by_category", ["category"]),

  // Registrations table
  registrations: defineTable({
    userId: v.id("users"),
    programId: v.id("programs"),
    status: v.union(
      v.literal("registered"),
      v.literal("waitlist"),
      v.literal("cancelled"),
      v.literal("checked_in")
    ),
    registeredAt: v.number(), // timestamp
  })
    .index("by_user", ["userId"])
    .index("by_program", ["programId"])
    .index("by_user_program", ["userId", "programId"]),

  // Results/Scores table
  results: defineTable({
    programId: v.id("programs"),
    userId: v.id("users"),
    score: v.optional(v.number()),
    rank: v.optional(v.number()), // 1, 2, 3 for winners
    points: v.optional(v.number()), // points earned
    notes: v.optional(v.string()),
  })
    .index("by_program", ["programId"])
    .index("by_user", ["userId"])
    .index("by_program_rank", ["programId", "rank"]),
});