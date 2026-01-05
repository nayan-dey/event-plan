import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Programs"
          value="24"
          change="+3 this week"
          changeType="positive"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          title="Total Registrations"
          value="186"
          change="+24 today"
          changeType="positive"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          title="Active Teams"
          value="12"
          change="5 forming"
          changeType="neutral"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Users"
          value="342"
          change="+18 new"
          changeType="positive"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton
            href="/admin/programs/new"
            label="Add Program"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
            color="bg-indigo-600"
          />
          <QuickActionButton
            href="/admin/registrations"
            label="View Registrations"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
            color="bg-green-600"
          />
          <QuickActionButton
            href="/admin/results/new"
            label="Add Results"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
            color="bg-yellow-600"
          />
          <QuickActionButton
            href="/admin/users"
            label="Manage Users"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            color="bg-purple-600"
          />
        </div>
      </div>

      {/* Recent Activity & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Registrations</h2>
            <Link href="/admin/registrations" className="text-sm text-indigo-600 hover:text-indigo-500">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            <RecentRegistration
              name="John Doe"
              event="100m Sprint"
              time="2 minutes ago"
            />
            <RecentRegistration
              name="Jane Smith"
              event="Super Singer"
              time="15 minutes ago"
            />
            <RecentRegistration
              name="Mike Johnson"
              event="Painting Competition"
              time="1 hour ago"
            />
            <RecentRegistration
              name="Sarah Williams"
              event="Classical Dance"
              time="2 hours ago"
            />
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Schedule</h2>
            <Link href="/admin/programs" className="text-sm text-indigo-600 hover:text-indigo-500">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            <ScheduleItem
              time="10:00 AM"
              name="100m Sprint"
              venue="Main Ground"
              participants={45}
            />
            <ScheduleItem
              time="11:00 AM"
              name="Painting Competition"
              venue="Art Room"
              participants={28}
            />
            <ScheduleItem
              time="2:00 PM"
              name="Super Singer"
              venue="Auditorium"
              participants={32}
            />
            <ScheduleItem
              time="4:00 PM"
              name="Rope Pull"
              venue="Sports Complex"
              participants={48}
              isTeam
            />
          </div>
        </div>
      </div>

      {/* Day Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Days Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DayCard
            day={1}
            date="January 15, 2024"
            programs={8}
            registrations={62}
            status="upcoming"
          />
          <DayCard
            day={2}
            date="January 16, 2024"
            programs={10}
            registrations={74}
            status="upcoming"
          />
          <DayCard
            day={3}
            date="January 17, 2024"
            programs={6}
            registrations={50}
            status="upcoming"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  changeType,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}) {
  const changeColors = {
    positive: "text-green-600 bg-green-50",
    negative: "text-red-600 bg-red-50",
    neutral: "text-gray-600 bg-gray-50",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
          {icon}
        </div>
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${changeColors[changeType]}`}>
          {change}
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

function QuickActionButton({
  href,
  label,
  icon,
  color,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Link
      href={href}
      className={`${color} text-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

function RecentRegistration({
  name,
  event,
  time,
}: {
  name: string;
  event: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-600">
          {name.charAt(0)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
        <p className="text-sm text-gray-500 truncate">{event}</p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
    </div>
  );
}

function ScheduleItem({
  time,
  name,
  venue,
  participants,
  isTeam,
}: {
  time: string;
  name: string;
  venue: string;
  participants: number;
  isTeam?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="text-center min-w-[60px]">
        <p className="text-sm font-semibold text-indigo-600">{time}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-500">{venue}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-500">
        {isTeam ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
        <span>{participants}</span>
      </div>
    </div>
  );
}

function DayCard({
  day,
  date,
  programs,
  registrations,
  status,
}: {
  day: number;
  date: string;
  programs: number;
  registrations: number;
  status: "completed" | "ongoing" | "upcoming";
}) {
  const statusColors = {
    completed: "bg-green-100 text-green-700",
    ongoing: "bg-yellow-100 text-yellow-700",
    upcoming: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold text-gray-900">Day {day}</span>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-4">{date}</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold text-indigo-600">{programs}</p>
          <p className="text-xs text-gray-500">Programs</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-indigo-600">{registrations}</p>
          <p className="text-xs text-gray-500">Registrations</p>
        </div>
      </div>
    </div>
  );
}
