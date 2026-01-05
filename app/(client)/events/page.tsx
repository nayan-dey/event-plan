"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

const categories = [
  { value: "all", label: "All", emoji: "🎯" },
  { value: "sports", label: "Sports", emoji: "⚽" },
  { value: "art", label: "Art", emoji: "🎨" },
  { value: "music", label: "Music", emoji: "🎵" },
  { value: "dance", label: "Dance", emoji: "💃" },
  { value: "fun", label: "Fun", emoji: "🎉" },
  { value: "other", label: "Other", emoji: "✨" },
];

const days = [
  { value: 0, label: "All Days" },
  { value: 1, label: "Day 1" },
  { value: 2, label: "Day 2" },
  { value: 3, label: "Day 3" },
];

export default function EventsPage() {
  const { user: clerkUser } = useUser();
  const user = useQuery(api.users.current);
  
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDay, setSelectedDay] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Events</h1>
              <p className="text-sm text-gray-500">
                {user?.firstName
                  ? `Hey ${user.firstName}, find your next event!`
                  : "Find your next event!"}
              </p>
            </div>
            {clerkUser?.imageUrl && (
              <img
                src={clerkUser.imageUrl}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-indigo-100"
              />
            )}
          </div>

          {/* Search bar */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border-0 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all touch-target"
            />
          </div>
        </div>

        {/* Category filter - horizontal scroll */}
        <div className="px-4 pb-3 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-all touch-target ${
                  selectedCategory === cat.value
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{cat.emoji}</span>
                <span className="text-sm font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Day filter */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto hide-scrollbar">
          {days.map((day) => (
            <button
              key={day.value}
              onClick={() => setSelectedDay(day.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all touch-target ${
                selectedDay === day.value
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </header>

      {/* Events Grid */}
      <main className="p-4">
        <EventsList
          category={selectedCategory}
          day={selectedDay}
          search={searchQuery}
          userGender={user?.gender}
          userAge={user?.age}
        />
      </main>
    </div>
  );
}

function EventsList({
  category,
  day,
  search,
  userGender,
  userAge,
}: {
  category: string;
  day: number;
  search: string;
  userGender?: string;
  userAge?: number;
}) {
  // For now, show a placeholder since we don't have the programs query yet
  // This will be connected to Convex queries
  
  return (
    <div className="space-y-4">
      {/* Placeholder cards */}
      <EventCard
        title="100m Sprint"
        category="sports"
        time="10:00 AM"
        venue="Main Ground"
        day={1}
        isTeamEvent={false}
        gender="all"
      />
      <EventCard
        title="Super Singer"
        category="music"
        time="2:00 PM"
        venue="Auditorium"
        day={1}
        isTeamEvent={false}
        gender="all"
        requiresSongLink
      />
      <EventCard
        title="Rope Pull"
        category="sports"
        time="4:00 PM"
        venue="Sports Complex"
        day={2}
        isTeamEvent={true}
        teamSize="6-8 members"
        gender="male"
      />
      <EventCard
        title="Classical Dance"
        category="dance"
        time="11:00 AM"
        venue="Dance Hall"
        day={2}
        isTeamEvent={false}
        gender="female"
        requiresSongLink
      />
      <EventCard
        title="Painting Competition"
        category="art"
        time="9:00 AM"
        venue="Art Room"
        day={3}
        isTeamEvent={false}
        gender="all"
      />

      {/* Empty state */}
      {false && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No events found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters or search query
          </p>
        </div>
      )}
    </div>
  );
}

function EventCard({
  title,
  category,
  time,
  venue,
  day,
  isTeamEvent,
  teamSize,
  gender,
  requiresSongLink,
}: {
  title: string;
  category: string;
  time: string;
  venue: string;
  day: number;
  isTeamEvent: boolean;
  teamSize?: string;
  gender: string;
  requiresSongLink?: boolean;
}) {
  const categoryEmojis: Record<string, string> = {
    sports: "⚽",
    art: "🎨",
    music: "🎵",
    dance: "💃",
    fun: "🎉",
    other: "✨",
  };

  const categoryColors: Record<string, string> = {
    sports: "bg-green-100 text-green-700",
    art: "bg-pink-100 text-pink-700",
    music: "bg-purple-100 text-purple-700",
    dance: "bg-orange-100 text-orange-700",
    fun: "bg-yellow-100 text-yellow-700",
    other: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform">
      <div className="flex items-start gap-4">
        {/* Category badge */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${categoryColors[category]}`}
        >
          {categoryEmojis[category]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
              Day {day}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {time}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {venue}
            </span>
          </div>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {isTeamEvent && (
              <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                👥 Team {teamSize && `(${teamSize})`}
              </span>
            )}
            {gender !== "all" && (
              <span className="text-xs font-medium bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">
                {gender === "male" ? "👨 Male only" : "👩 Female only"}
              </span>
            )}
            {requiresSongLink && (
              <span className="text-xs font-medium bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                🎵 Song required
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Register button */}
      <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3 rounded-xl transition-colors touch-target">
        {isTeamEvent ? "Join / Create Team" : "Register"}
      </button>
    </div>
  );
}
