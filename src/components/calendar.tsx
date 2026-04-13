"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import type { Event } from "@/types";

interface CalendarProps {
  initialMonth?: Date;
}

export function Calendar({ initialMonth = new Date() }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;

    fetch(`/api/events?page=1&pageSize=100&timeRange=all`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.data || []);
      });
  }, [currentMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.starts_at * 1000);
      return isSameDay(eventDate, date);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="bg-gray-50 px-2 py-2 text-xs font-medium text-gray-500 text-center"
          >
            {d}
          </div>
        ))}

        {days.map((d, i) => {
          const dayEvents = getEventsForDay(d);
          const inMonth = isSameMonth(d, currentMonth);

          return (
            <div
              key={i}
              className={`bg-white min-h-[80px] p-1 ${
                !inMonth ? "opacity-40" : ""
              } ${isToday(d) ? "ring-2 ring-blue-500 ring-inset" : ""}`}
            >
              <p className="text-xs font-medium text-gray-700 mb-1">
                {format(d, "d")}
              </p>
              <div className="space-y-0.5 overflow-hidden max-h-[60px]">
                {dayEvents.slice(0, 3).map((event) => (
                  <a
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block text-[10px] leading-tight px-1 py-0.5 rounded bg-blue-100 text-blue-800 truncate hover:bg-blue-200"
                  >
                    {event.all_day
                      ? event.title
                      : `${format(new Date(event.starts_at * 1000), "h:mm a")} ${event.title}`}
                  </a>
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-[10px] text-gray-400 px-1">
                    +{dayEvents.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
