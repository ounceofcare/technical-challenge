"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import type { EventWithDetails, AttendeeWithResident } from "@/types";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventWithDetails | null>(null);
  const [attendees, setAttendees] = useState<AttendeeWithResident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${id}`).then((res) => res.json()),
      fetch(`/api/events/${id}/attendees`).then((res) => res.json()),
    ])
      .then(([eventData, attendeeData]) => {
        setEvent(eventData);
        setAttendees(attendeeData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!event) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Event not found</p>
        <Link href="/events" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          Back to events
        </Link>
      </div>
    );
  }

  // Detail page correctly filters to active attendees
  const activeAttendees = attendees.filter(
    (a) => a.status === "registered" || a.status === "checked_in"
  );

  return (
    <div>
      <div className="mb-6">
        <Link href="/events" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to events
        </Link>
      </div>

      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <StatusBadge status={event.event_type} />
        </div>

        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Community</dt>
            <dd className="text-sm">{event.community_name}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">All Day</dt>
            <dd className="text-sm">{event.all_day ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Capacity</dt>
            <dd className="text-sm">{event.capacity || "Unlimited"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Attendees</dt>
            <dd className="text-sm">{activeAttendees.length}{event.capacity ? ` / ${event.capacity}` : ""}</dd>
          </div>
          {event.description && (
            <div className="col-span-2">
              <dt className="text-sm text-gray-500">Description</dt>
              <dd className="text-sm">{event.description}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">
          Attendees ({activeAttendees.length})
        </h2>
        {attendees.length === 0 ? (
          <p className="text-sm text-gray-500">No attendees</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {attendees.map((attendee) => (
                <tr key={attendee.id}>
                  <td className="px-4 py-2">
                    {attendee.resident_name ? (
                      <Link
                        href={`/residents/${attendee.resident_id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {attendee.resident_name}
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Unknown resident</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {attendee.resident_email || "—"}
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={attendee.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
