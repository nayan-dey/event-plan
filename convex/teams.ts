import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============ Queries ============

// Get teams for a program
export const listByProgram = query({
  args: { programId: v.id("programs") },
  handler: async (ctx, { programId }) => {
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_program", (q) => q.eq("programId", programId))
      .collect();

    // Get member counts
    const withDetails = await Promise.all(
      teams.map(async (team) => {
        const members = await ctx.db
          .query("teamMembers")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();
        const captain = await ctx.db.get(team.captainId);
        return { ...team, memberCount: members.length, captain };
      })
    );

    return withDetails;
  },
});

// Get user's teams
export const myTeams = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    // Teams where user is captain
    const captainTeams = await ctx.db
      .query("teams")
      .withIndex("by_captain", (q) => q.eq("captainId", user._id))
      .collect();

    // Teams where user is member
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const memberTeamIds = memberships.map((m) => m.teamId);
    const memberTeams = await Promise.all(
      memberTeamIds.map((id) => ctx.db.get(id))
    );

    // Combine and dedupe
    const allTeams = [...captainTeams];
    for (const team of memberTeams) {
      if (team && !allTeams.find((t) => t._id === team._id)) {
        allTeams.push(team);
      }
    }

    // Fetch program details
    const withPrograms = await Promise.all(
      allTeams.map(async (team) => {
        const program = await ctx.db.get(team.programId);
        const members = await ctx.db
          .query("teamMembers")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();
        return { ...team, program, memberCount: members.length };
      })
    );

    return withPrograms.filter((t) => t.status !== "cancelled");
  },
});

// Get team details with members
export const getWithMembers = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, { teamId }) => {
    const team = await ctx.db.get(teamId);
    if (!team) return null;

    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", teamId))
      .collect();

    const program = await ctx.db.get(team.programId);
    const captain = await ctx.db.get(team.captainId);

    // Fetch user details for app users
    const membersWithDetails = await Promise.all(
      members.map(async (member) => {
        if (member.isAppUser && member.userId) {
          const user = await ctx.db.get(member.userId);
          return { ...member, user };
        }
        return { ...member, user: null };
      })
    );

    return { ...team, members: membersWithDetails, program, captain };
  },
});

// Check if user is in a team for a program
export const getUserTeamForProgram = query({
  args: { programId: v.id("programs") },
  handler: async (ctx, { programId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    // Check if captain of a team
    const captainTeam = await ctx.db
      .query("teams")
      .withIndex("by_captain", (q) => q.eq("captainId", user._id))
      .filter((q) => q.eq(q.field("programId"), programId))
      .first();

    if (captainTeam && captainTeam.status !== "cancelled") {
      return { team: captainTeam, isCaptain: true };
    }

    // Check if member of a team
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const membership of memberships) {
      const team = await ctx.db.get(membership.teamId);
      if (team && team.programId === programId && team.status !== "cancelled") {
        return { team, isCaptain: false };
      }
    }

    return null;
  },
});

// ============ Mutations ============

// Create a team
export const create = mutation({
  args: {
    programId: v.id("programs"),
    name: v.string(),
  },
  handler: async (ctx, { programId, name }) => {
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
    if (!program.isTeamEvent) throw new Error("This is not a team event");
    if (!program.isOpen) throw new Error("Registration closed");

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

    // Check if already in a team for this program
    const existingTeam = await ctx.db
      .query("teams")
      .withIndex("by_captain", (q) => q.eq("captainId", user._id))
      .filter((q) => q.eq(q.field("programId"), programId))
      .first();

    if (existingTeam && existingTeam.status !== "cancelled") {
      throw new Error("You already have a team for this event");
    }

    // Create team
    const teamId = await ctx.db.insert("teams", {
      name,
      programId,
      captainId: user._id,
      status: "forming",
      createdAt: Date.now(),
    });

    // Add captain as first member
    await ctx.db.insert("teamMembers", {
      teamId,
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      isAppUser: true,
      joinedAt: Date.now(),
    });

    return teamId;
  },
});

// Add member to team (by captain)
export const addMember = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
    phone: v.optional(v.string()),
    userId: v.optional(v.id("users")), // If adding app user
  },
  handler: async (ctx, { teamId, name, phone, userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) throw new Error("User not found");

    const team = await ctx.db.get(teamId);
    if (!team) throw new Error("Team not found");
    if (team.captainId !== currentUser._id) {
      throw new Error("Only captain can add members");
    }
    if (team.status !== "forming") {
      throw new Error("Cannot modify submitted team");
    }

    const program = await ctx.db.get(team.programId);
    if (!program) throw new Error("Program not found");

    // Check max team size
    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", teamId))
      .collect();

    if (program.maxTeamSize && members.length >= program.maxTeamSize) {
      throw new Error(`Maximum team size is ${program.maxTeamSize}`);
    }

    // Add member
    const memberId = await ctx.db.insert("teamMembers", {
      teamId,
      userId: userId || currentUser._id, // Fallback, but won't be accurate
      name,
      phone,
      isAppUser: !!userId,
      joinedAt: Date.now(),
    });

    return memberId;
  },
});

// Remove member from team
export const removeMember = mutation({
  args: {
    memberId: v.id("teamMembers"),
  },
  handler: async (ctx, { memberId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) throw new Error("User not found");

    const member = await ctx.db.get(memberId);
    if (!member) throw new Error("Member not found");

    const team = await ctx.db.get(member.teamId);
    if (!team) throw new Error("Team not found");

    // Only captain can remove, or user can remove themselves
    const isCaptain = team.captainId === currentUser._id;
    const isSelf = member.userId === currentUser._id;

    if (!isCaptain && !isSelf) {
      throw new Error("Not authorized to remove this member");
    }

    // Captain can't remove themselves
    if (isCaptain && isSelf) {
      throw new Error("Captain cannot leave. Delete the team instead.");
    }

    await ctx.db.delete(memberId);
    return true;
  },
});

// Submit team (mark as registered)
export const submit = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, { teamId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) throw new Error("User not found");

    const team = await ctx.db.get(teamId);
    if (!team) throw new Error("Team not found");
    if (team.captainId !== currentUser._id) {
      throw new Error("Only captain can submit team");
    }

    const program = await ctx.db.get(team.programId);
    if (!program) throw new Error("Program not found");

    // Check minimum team size
    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", teamId))
      .collect();

    if (program.minTeamSize && members.length < program.minTeamSize) {
      throw new Error(`Need at least ${program.minTeamSize} members`);
    }

    await ctx.db.patch(teamId, { status: "registered" });

    // Create registrations for all app users in team
    for (const member of members) {
      if (member.isAppUser && member.userId) {
        const existingReg = await ctx.db
          .query("registrations")
          .withIndex("by_user_program", (q) => 
            q.eq("userId", member.userId!).eq("programId", program._id)
          )
          .first();

        if (!existingReg) {
          await ctx.db.insert("registrations", {
            userId: member.userId,
            programId: program._id,
            status: "registered",
            teamId,
            registeredAt: Date.now(),
          });
        }
      }
    }

    return true;
  },
});

// Delete team (cancel)
export const deleteTeam = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, { teamId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) throw new Error("User not found");

    const team = await ctx.db.get(teamId);
    if (!team) throw new Error("Team not found");
    if (team.captainId !== currentUser._id) {
      throw new Error("Only captain can delete team");
    }

    await ctx.db.patch(teamId, { status: "cancelled" });

    // Cancel related registrations
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_team", (q) => q.eq("teamId", teamId))
      .collect();

    for (const reg of registrations) {
      await ctx.db.patch(reg._id, { status: "cancelled" });
    }

    return true;
  },
});