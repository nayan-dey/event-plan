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
    dateOfBirth: v.optional(v.string()), // ISO date string
    age: v.optional(v.number()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    phone: v.optional(v.string()),

    // Role
    role: v.optional(v.union(v.literal("participant"), v.literal("admin"), v.literal("judge"))),
    
    // Profile completion flag
    isProfileComplete: v.optional(v.boolean()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Programs table
  programs: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    rules: v.optional(v.string()),
    imageUrl: v.optional(v.string()), // Event image
    
    // Schedule
    day: v.number(), // 1, 2, 3
    time: v.string(), // e.g., "10:00 AM"
    venue: v.optional(v.string()), // Event location
    
    // Category
    category: v.union(
      v.literal("sports"),
      v.literal("art"),
      v.literal("music"),
      v.literal("dance"),
      v.literal("fun"),
      v.literal("other")
    ),
    
    // Eligibility
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("all")),
    minAge: v.optional(v.number()),
    maxAge: v.optional(v.number()),
    
    // Team settings
    isTeamEvent: v.boolean(),
    minTeamSize: v.optional(v.number()),
    maxTeamSize: v.optional(v.number()),
    
    // Special requirements
    requiresSongLink: v.optional(v.boolean()), // For dance, super singer
    requiresSubject: v.optional(v.boolean()), // Admin assigns subject/poem
    subject: v.optional(v.string()), // The assigned subject/poem (set by admin)
    
    // For finals/rounds
    isQualifierRound: v.optional(v.boolean()),
    isFinalRound: v.optional(v.boolean()),
    qualifierProgramId: v.optional(v.id("programs")), // Links to qualifier
    
    // Status
    isOpen: v.boolean(),
    maxParticipants: v.optional(v.number()),
  })
    .index("by_day", ["day"])
    .index("by_category", ["category"])
    .index("by_is_open", ["isOpen"]),

  // Individual Registrations
  registrations: defineTable({
    userId: v.id("users"),
    programId: v.id("programs"),
    
    status: v.union(
      v.literal("registered"),
      v.literal("waitlist"),
      v.literal("cancelled"),
      v.literal("checked_in"),
      v.literal("qualified"), // For finals
      v.literal("disqualified")
    ),
    
    // For dance/super singer
    songLink: v.optional(v.string()),
    songTitle: v.optional(v.string()),
    
    // Metadata
    registeredAt: v.number(),
    
    // For team events - link to team
    teamId: v.optional(v.id("teams")),
  })
    .index("by_user", ["userId"])
    .index("by_program", ["programId"])
    .index("by_user_program", ["userId", "programId"])
    .index("by_team", ["teamId"]),

  // Teams (for Rope Pull, etc.)
  teams: defineTable({
    name: v.string(),
    programId: v.id("programs"),
    captainId: v.id("users"), // Team leader
    
    status: v.union(
      v.literal("forming"), // Still accepting members
      v.literal("registered"), // Submitted
      v.literal("cancelled")
    ),
    
    createdAt: v.number(),
  })
    .index("by_program", ["programId"])
    .index("by_captain", ["captainId"]),

  // Team Members
  teamMembers: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    name: v.string(), // Can add non-app members by name
    phone: v.optional(v.string()),
    isAppUser: v.boolean(), // Whether this is a registered user
    joinedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"]),

  // Results/Scores table
  results: defineTable({
    programId: v.id("programs"),
    
    // Can be user or team
    userId: v.optional(v.id("users")),
    teamId: v.optional(v.id("teams")),
    
    score: v.optional(v.number()),
    rank: v.optional(v.number()), // 1, 2, 3 for winners
    points: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_program", ["programId"])
    .index("by_user", ["userId"])
    .index("by_team", ["teamId"])
    .index("by_program_rank", ["programId", "rank"]),
});