import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { getDb } from "@/lib/db";
import { getUpcomingEvents } from "@/lib/queries/events";
import { getOverdueRequirements, getComplianceStats } from "@/lib/queries/compliance";
import { formatDateTime, formatRelative, formatPercent } from "@/lib/formatters";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const db = getDb();

  const totalResidents = Number(
    (db.prepare("SELECT COUNT(*) as count FROM residents WHERE deleted_at IS NULL").get() as { count: number | bigint }).count
  );

  const totalCommunities = Number(
    (db.prepare("SELECT COUNT(*) as count FROM communities").get() as { count: number | bigint }).count
  );

  const upcomingEvents = getUpcomingEvents(5);
  const overdueRequirements = getOverdueRequirements();
  const complianceRates = getComplianceStats();

  const recentEvents = db
    .prepare(
      `SELECT events.*, communities.name as community_name
       FROM events
       LEFT JOIN communities ON events.community_id = communities.id
       ORDER BY events.created_at DESC
       LIMIT 5`
    )
    .all() as Array<{
      id: string;
      title: string;
      starts_at: number;
      created_at: number;
      community_name: string;
      event_type: string;
    }>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Residents" value={totalResidents} />
        <StatCard title="Communities" value={totalCommunities} />
        <StatCard
          title="Upcoming Events"
          value={upcomingEvents.length}
          variant="success"
        />
        <StatCard
          title="Overdue Compliance"
          value={overdueRequirements.length}
          variant={overdueRequirements.length > 0 ? "danger" : "success"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <Link href="/events" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming events</p>
          ) : (
            <ul className="space-y-3">
              {upcomingEvents.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.id}`}
                    className="block hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{event.title}</p>
                      <span className="text-xs text-gray-400 capitalize">{event.event_type}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {event.community_name}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Events</h2>
            <Link href="/events" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <ul className="space-y-3">
            {recentEvents.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/events/${event.id}`}
                  className="block hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{event.title}</p>
                    <StatusBadge status={event.event_type} />
                  </div>
                  <p className="text-xs text-gray-500">
                    {event.community_name} &middot; {formatRelative(event.created_at)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Compliance Rates */}
        <div className="bg-white rounded-lg border p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">
            Compliance Rates by Community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {complianceRates.map((cr) => (
              <div key={cr.community_name} className="text-center">
                <p className="text-sm text-gray-500">{cr.community_name}</p>
                <p className="text-2xl font-bold mt-1">
                  {formatPercent(cr.rate)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
