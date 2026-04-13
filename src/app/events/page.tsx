"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar } from "@/components/calendar";
import { StatusBadge } from "@/components/status-badge";
import type { EventWithDetails, PaginatedResponse } from "@/types";
import { useEffect } from "react";

export default function EventsPage() {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [events, setEvents] = useState<PaginatedResponse<EventWithDetails> | null>(null);

  useEffect(() => {
    if (view === "list") {
      fetch("/api/events?page=1&pageSize=50")
        .then((res) => res.json())
        .then(setEvents);
    }
  }, [view]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView("calendar")}
            className={`px-3 py-1.5 text-sm border rounded-md ${view === "calendar" ? "bg-gray-900 text-white" : "hover:bg-gray-50"}`}
          >
            Calendar
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 text-sm border rounded-md ${view === "list" ? "bg-gray-900 text-white" : "hover:bg-gray-50"}`}
          >
            List
          </button>
        </div>
      </div>

      {view === "calendar" ? (
        <div className="bg-white rounded-lg border p-6">
          <Calendar />
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <div className="overflow-hidden max-h-[500px]">
            {!events ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Community</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendees</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {events.data.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link href={`/events/${event.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                          {event.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={event.event_type} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {event.community_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {event.attendee_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
