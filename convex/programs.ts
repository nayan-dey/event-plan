import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============ Queries ============

// Get all programs
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("programs").collect();
  },
});

// Get programs by day
export const listByDay = query({
  args: { day: v.number() },
  handler: async (ctx, { day }) => {
    return await ctx.db
      .query("programs")
      .withIndex("by_day", (q) => q.eq("day", day))
      .collect();
  },
});

// Get programs grouped by day
export const listGroupedByDay = query({
  args: {},
  handler: async (ctx) => {
    const programs = await ctx.db.query("programs").collect();
    
    const grouped: Record<number, typeof programs> = { 1: [], 2: [], 3: [] };
    
    for (const program of programs) {
      if (grouped[program.day]) {
        grouped[program.day].push(program);
      }
    }
    
    // Sort by time within each day
    for (const day in grouped) {
      grouped[Number(day)].sort((a, b) => {
        const timeA = parseTime(a.time);
        const timeB = parseTime(b.time);
        return timeA - timeB;
      });
    }
    
    return grouped;
  },
});

// Get single program
export const get = query({
  args: { programId: v.id("programs") },
  handler: async (ctx, { programId }) => {
    return await ctx.db.get(programId);
  },
});

// Get programs eligible for a user
export const listEligible = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || !user.age || !user.gender) return [];

    const programs = await ctx.db
      .query("programs")
      .withIndex("by_is_open", (q) => q.eq("isOpen", true))
      .collect();

    return programs.filter((program) => {
      // Check gender
      if (program.gender !== "all") {
        if (program.gender === "male" && user.gender !== "male") return false;
        if (program.gender === "female" && user.gender !== "female") return false;
      }

      // Check age (user.age is guaranteed to exist from check above)
      const userAge = user.age!;
      if (program.minAge && userAge < program.minAge) return false;
      if (program.maxAge && userAge > program.maxAge) return false;

      return true;
    });
  },
});

// Check if user is eligible for a program
export const checkEligibility = query({
  args: { programId: v.id("programs") },
  handler: async (ctx, { programId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { eligible: false, reason: "Not authenticated" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return { eligible: false, reason: "User not found" };
    }

    if (!user.age || !user.gender) {
      return { eligible: false, reason: "Please complete your profile first" };
    }

    const program = await ctx.db.get(programId);
    if (!program) {
      return { eligible: false, reason: "Program not found" };
    }

    if (!program.isOpen) {
      return { eligible: false, reason: "Registration closed" };
    }

    // Check gender
    if (program.gender !== "all") {
      if (program.gender === "male" && user.gender !== "male") {
        return { eligible: false, reason: "This event is for men only" };
      }
      if (program.gender === "female" && user.gender !== "female") {
        return { eligible: false, reason: "This event is for women only" };
      }
    }

    // Check age
    if (program.minAge && user.age < program.minAge) {
      return { eligible: false, reason: `Minimum age is ${program.minAge}` };
    }
    if (program.maxAge && user.age > program.maxAge) {
      return { eligible: false, reason: `Maximum age is ${program.maxAge}` };
    }

    // Check if already registered
    const existingReg = await ctx.db
      .query("registrations")
      .withIndex("by_user_program", (q) => 
        q.eq("userId", user._id).eq("programId", programId)
      )
      .first();

    if (existingReg && existingReg.status !== "cancelled") {
      return { eligible: false, reason: "Already registered", registration: existingReg };
    }

    return { eligible: true, user };
  },
});

// Get participant count for a program
export const getParticipantCount = query({
  args: { programId: v.id("programs") },
  handler: async (ctx, { programId }) => {
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_program", (q) => q.eq("programId", programId))
      .collect();

    return registrations.filter(
      (r) => r.status === "registered" || r.status === "checked_in"
    ).length;
  },
});

// ============ Mutations ============

// Seed initial programs (run once)
export const seedPrograms = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("programs").first();
    if (existing) return "Already seeded";

    const programs = [
      // Day 1 - Sports Day
      {
        name: "Marathon",
        day: 1,
        time: "7:00 AM",
        venue: "Main Ground",
        category: "sports" as const,
        gender: "all" as const,
        isTeamEvent: false,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop",
      },
      {
        name: "Math Run",
        description: "Fun math challenges while running",
        day: 1,
        time: "9:00 AM",
        venue: "School Corridor",
        category: "sports" as const,
        gender: "all" as const,
        maxAge: 10,
        isTeamEvent: false,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400&h=300&fit=crop",
      },
      {
        name: "Frog Race",
        description: "Hop your way to victory",
        day: 1,
        time: "10:00 AM",
        venue: "Playground",
        category: "fun" as const,
        gender: "all" as const,
        maxAge: 10,
        isTeamEvent: false,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
      },
      {
        name: "Balloon Cracking",
        description: "Pop as many balloons as you can",
        day: 1,
        time: "11:00 AM",
        venue: "Community Hall",
        category: "fun" as const,
        gender: "all" as const,
        maxAge: 10,
        isTeamEvent: false,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop",
      },
      {
        name: "Shot Put",
        description: "Test your throwing strength",
        day: 1,
        time: "12:00 PM",
        venue: "Athletics Field",
        category: "sports" as const,
        gender: "male" as const,
        isTeamEvent: false,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop",
      },
      {
        name: "Javelin Throw",
        description: "Aim for the distance",
        day: 1,
        time: "2:00 PM",
        venue: "Athletics Field",
        category: "sports" as const,
        gender: "male" as const,
        isTeamEvent: false,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1461896836934- voices-of-our-land-w?w=400&h=300&fit=crop",
      },

      // Day 2 - Art & Culture
      {
        name: "Drawing Junior",
        description: "Art competition for young artists",
        day: 2,
        time: "9:00 AM",
        venue: "Art Room",
        category: "art" as const,
        gender: "all" as const,
        maxAge: 14,
        isTeamEvent: false,
        requiresSubject: true,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop",
      },
      {
        name: "Drawing Senior",
        description: "Art competition for senior artists",
        day: 2,
        time: "9:00 AM",
        venue: "Art Room",
        category: "art" as const,
        gender: "all" as const,
        minAge: 15,
        isTeamEvent: false,
        requiresSubject: true,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop",
      },
      {
        name: "Poetry Recitation Junior",
        description: "Recite your favorite poems",
        day: 2,
        time: "11:00 AM",
        venue: "Auditorium",
        category: "music" as const,
        gender: "all" as const,
        maxAge: 14,
        isTeamEvent: false,
        requiresSubject: true,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop",
      },
      {
        name: "Poetry Recitation Senior",
        description: "Recite your favorite poems",
        day: 2,
        time: "11:00 AM",
        venue: "Auditorium",
        category: "music" as const,
        gender: "all" as const,
        minAge: 15,
        isTeamEvent: false,
        requiresSubject: true,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&h=300&fit=crop",
      },
      {
        name: "Goal into the Well",
        description: "Aim and score",
        day: 2,
        time: "2:00 PM",
        venue: "Sports Complex",
        category: "sports" as const,
        gender: "female" as const,
        minAge: 12,
        isTeamEvent: false,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
      },
      {
        name: "Musical Chair",
        description: "Classic party game",
        day: 2,
        time: "3:00 PM",
        venue: "Community Hall",
        category: "fun" as const,
        gender: "female" as const,
        minAge: 15,
        isTeamEvent: false,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
      },
      {
        name: "Conch Shell Blowing",
        description: "Traditional conch shell competition",
        day: 2,
        time: "4:00 PM",
        venue: "Temple Ground",
        category: "music" as const,
        gender: "female" as const,
        minAge: 15,
        isTeamEvent: false,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=300&fit=crop",
      },

      // Day 3 - Finals Day
      {
        name: "Dance",
        description: "Solo dance performance",
        day: 3,
        time: "10:00 AM",
        venue: "Main Stage",
        category: "dance" as const,
        gender: "all" as const,
        isTeamEvent: false,
        requiresSongLink: true,
        isQualifierRound: true,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=400&h=300&fit=crop",
      },
      {
        name: "Super Singer",
        description: "Singing competition",
        day: 3,
        time: "12:00 PM",
        venue: "Auditorium",
        category: "music" as const,
        gender: "all" as const,
        isTeamEvent: false,
        requiresSongLink: true,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop",
      },
      {
        name: "Fancy Dress",
        description: "Dress up as you like",
        day: 3,
        time: "2:00 PM",
        venue: "Main Stage",
        category: "fun" as const,
        gender: "all" as const,
        isTeamEvent: false,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop",
      },
      {
        name: "Eating Competition",
        description: "Speed eating challenge",
        day: 3,
        time: "3:00 PM",
        venue: "Food Court",
        category: "fun" as const,
        gender: "female" as const,
        minAge: 15,
        isTeamEvent: false,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
      },
      {
        name: "Pocket Ball",
        description: "Ball in pocket challenge",
        day: 3,
        time: "3:30 PM",
        venue: "Game Zone",
        category: "sports" as const,
        gender: "female" as const,
        minAge: 15,
        isTeamEvent: false,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1529088746738-c4c0a152fb47?w=400&h=300&fit=crop",
      },
      {
        name: "Tug of War",
        description: "Team of 5-10 members",
        day: 3,
        time: "4:00 PM",
        venue: "Main Ground",
        category: "sports" as const,
        gender: "all" as const,
        minAge: 15,
        isTeamEvent: true,
        minTeamSize: 5,
        maxTeamSize: 10,
        isOpen: true,
        imageUrl: "https://images.unsplash.com/photo-1521798552185-ee955b1b91fa?w=400&h=300&fit=crop",
      },
      {
        name: "Dance Finals",
        description: "Top performers from Dance qualifier",
        day: 3,
        time: "5:00 PM",
        venue: "Main Stage",
        category: "dance" as const,
        gender: "all" as const,
        isTeamEvent: false,
        isFinalRound: true,
        isOpen: false,
        imageUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&h=300&fit=crop",
      },
    ];

    for (const program of programs) {
      await ctx.db.insert("programs", program);
    }

    return "Seeded " + programs.length + " programs";
  },
});

// Helper function
function parseTime(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
}