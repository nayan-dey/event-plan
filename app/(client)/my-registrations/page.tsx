"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

const tabs = [
  { id: "registered", label: "Registered" },
  { id: "teams", label: "My Teams" },
  { id: "results", label: "Results" },
];

export default function MyRegistrationsPage() {
  const [activeTab, setActiveTab] = useState("registered");
  const user = useQuery(api.users.current);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
          <p className="text-sm text-gray-500">
            Track your registrations and results
          </p>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-3 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all touch-target ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="p-4">
        {activeTab === "registered" && <RegisteredEvents />}
        {activeTab === "teams" && <MyTeams />}
        {activeTab === "results" && <MyResults />}
      </main>
    </div>
  );
}

function RegisteredEvents() {
  // Placeholder - will connect to Convex
  return (
    <div className="space-y-4">
      <RegistrationCard
        title="100m Sprint"
        category="sports"
        time="10:00 AM"
        venue="Main Ground"
        day={1}
        status="registered"
      />
      <RegistrationCard
        title="Super Singer"
        category="music"
        time="2:00 PM"
        venue="Auditorium"
        day={1}
        status="registered"
        songTitle="My Song"
      />

      {/* Empty state */}
      {false && (
        <EmptyState
          icon={
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title="No registrations yet"
          description="Browse events and register to see them here"
          actionLabel="Browse Events"
          actionHref="/events"
        />
      )}
    </div>
  );
}

function MyTeams() {
  return (
    <div className="space-y-4">
      <TeamCard
        name="Speed Demons"
        eventName="Rope Pull"
        memberCount={6}
        maxMembers={8}
        status="forming"
        isCaptain={true}
      />

      {/* Empty state */}
      {false && (
        <EmptyState
          icon={
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          title="No teams yet"
          description="Join or create a team for team events"
          actionLabel="Browse Team Events"
          actionHref="/events"
        />
      )}
    </div>
  );
}

function MyResults() {
  return (
    <div className="space-y-4">
      <ResultCard
        title="100m Sprint"
        category="sports"
        rank={2}
        points={15}
      />

      {/* Empty state */}
      {false && (
        <EmptyState
          icon={
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
          title="No results yet"
          description="Results will appear here after events"
        />
      )}
    </div>
  );
}

function RegistrationCard({
  title,
  category,
  time,
  venue,
  day,
  status,
  songTitle,
}: {
  title: string;
  category: string;
  time: string;
  venue: string;
  day: number;
  status: string;
  songTitle?: string;
}) {
  const categoryEmojis: Record<string, string> = {
    sports: "⚽",
    art: "🎨",
    music: "🎵",
    dance: "💃",
    fun: "🎉",
    other: "✨",
  };

  const statusColors: Record<string, string> = {
    registered: "bg-green-100 text-green-700",
    waitlist: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
    checked_in: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl">
          {categoryEmojis[category]}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[status]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
            </span>
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Day {day} • {time} • {venue}
          </div>
          {songTitle && (
            <div className="mt-2 text-sm text-purple-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              {songTitle}
            </div>
          )}
        </div>
      </div>
      <button className="w-full mt-4 text-red-600 font-medium py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors touch-target">
        Cancel Registration
      </button>
    </div>
  );
}

function TeamCard({
  name,
  eventName,
  memberCount,
  maxMembers,
  status,
  isCaptain,
}: {
  name: string;
  eventName: string;
  memberCount: number;
  maxMembers: number;
  status: string;
  isCaptain: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{name}</h3>
            {isCaptain && (
              <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                Captain
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{eventName}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          status === "forming" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      {/* Member count */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Team Members</span>
          <span className="font-medium text-gray-900">{memberCount}/{maxMembers}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${(memberCount / maxMembers) * 100}%` }}
          />
        </div>
      </div>

      {isCaptain && (
        <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors touch-target">
          Manage Team
        </button>
      )}
    </div>
  );
}

function ResultCard({
  title,
  category,
  rank,
  points,
}: {
  title: string;
  category: string;
  rank: number;
  points: number;
}) {
  const rankBadges: Record<number, { bg: string; text: string; emoji: string }> = {
    1: { bg: "bg-yellow-100", text: "text-yellow-700", emoji: "🥇" },
    2: { bg: "bg-gray-100", text: "text-gray-700", emoji: "🥈" },
    3: { bg: "bg-orange-100", text: "text-orange-700", emoji: "🥉" },
  };

  const badge = rankBadges[rank] || { bg: "bg-gray-100", text: "text-gray-700", emoji: "🏅" };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${badge.bg}`}>
          {badge.emoji}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 capitalize">{category}</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${badge.text}`}>#{rank}</div>
          <div className="text-sm text-gray-500">{points} pts</div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {actionLabel && actionHref && (
        <a
          href={actionHref}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {actionLabel}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      )}
    </div>
  );
}
