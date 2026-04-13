import { getDb } from "@/lib/db";
import type { Event, EventWithDetails, AttendeeWithResident, PaginatedResponse } from "@/types";

export function getEvents(options: {
  page?: number;
  pageSize?: number;
  community_id?: string;
  event_type?: string;
  timeRange?: "upcoming" | "past" | "all";
}): PaginatedResponse<EventWithDetails> {
  const db = getDb();
  const {
    page = 1,
    pageSize = 20,
    community_id,
    event_type,
    timeRange = "all",
  } = options;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (community_id) {
    conditions.push("events.community_id = ?");
    params.push(community_id);
  }

  if (event_type) {
    conditions.push("events.event_type = ?");
    params.push(event_type);
  }

  const now = Math.floor(Date.now() / 1000);
  if (timeRange === "upcoming") {
    conditions.push("events.starts_at > ?");
    params.push(now);
  } else if (timeRange === "past") {
    conditions.push("events.starts_at <= ?");
    params.push(now);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const offset = (page - 1) * pageSize;

  const countRow = db
    .prepare(`SELECT COUNT(*) as count FROM events ${whereClause}`)
    .get(...params) as { count: number };

  const total = Number(countRow.count);

  const rows = db
    .prepare(
      `SELECT events.*,
              communities.name as community_name,
              COUNT(event_attendees.id) as attendee_count
       FROM events
       LEFT JOIN communities ON events.community_id = communities.id
       LEFT JOIN event_attendees ON events.id = event_attendees.event_id
       ${whereClause}
       GROUP BY events.id
       ORDER BY events.starts_at DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, pageSize, offset) as EventWithDetails[];

  return {
    data: rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export function getUpcomingEvents(limit = 5): EventWithDetails[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT events.*, communities.name as community_name
       FROM events
       LEFT JOIN communities ON events.community_id = communities.id
       WHERE events.starts_at > ?
       ORDER BY events.starts_at ASC
       LIMIT ?`
    )
    .all(Date.now(), limit) as EventWithDetails[];
}

export function getEventById(id: string): EventWithDetails | null {
  const db = getDb();

  const event = db
    .prepare(
      `SELECT events.*, communities.name as community_name
       FROM events
       LEFT JOIN communities ON events.community_id = communities.id
       WHERE events.id = ?`
    )
    .get(id) as EventWithDetails | undefined;

  if (!event) return null;

  const attendeeCount = db
    .prepare(
      `SELECT COUNT(*) as count FROM event_attendees
       WHERE event_id = ? AND status IN ('registered', 'checked_in')`
    )
    .get(id) as { count: number };

  event.attendee_count = Number(attendeeCount.count);

  return event;
}

export function getEventAttendees(eventId: string): AttendeeWithResident[] {
  const db = getDb();

  return db
    .prepare(
      `SELECT event_attendees.*,
              residents.name as resident_name,
              residents.email as resident_email
       FROM event_attendees
       LEFT JOIN residents ON event_attendees.resident_id = residents.id
       WHERE event_attendees.event_id = ?
       ORDER BY event_attendees.created_at ASC`
    )
    .all(eventId) as AttendeeWithResident[];
}

export function createEvent(data: {
  title: string;
  description?: string;
  community_id: string;
  event_type?: string;
  starts_at: number;
  ends_at: number;
  all_day?: boolean;
  capacity?: number;
}): Event {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  db.prepare(
    `INSERT INTO events (id, title, description, community_id, event_type, starts_at, ends_at, all_day, capacity, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, data.title, data.description || null, data.community_id,
    data.event_type || "general", data.starts_at, data.ends_at,
    data.all_day ? 1 : 0, data.capacity || null, now
  );

  return db.prepare("SELECT * FROM events WHERE id = ?").get(id) as Event;
}

export function addAttendee(eventId: string, residentId: string): boolean {
  const db = getDb();
  const { nanoid } = require("nanoid") as { nanoid: () => string };

  // Check capacity
  const event = db
    .prepare("SELECT capacity FROM events WHERE id = ?")
    .get(eventId) as { capacity: number | null } | undefined;

  if (!event) return false;

  if (event.capacity !== null) {
    const currentCount = db
      .prepare(
        "SELECT COUNT(*) as count FROM event_attendees WHERE event_id = ? AND status IN ('registered', 'checked_in')"
      )
      .get(eventId) as { count: number };

    if (Number(currentCount.count) >= event.capacity) return false;
  }

  const id = nanoid();
  const now = Math.floor(Date.now() / 1000);

  db.prepare(
    "INSERT INTO event_attendees (id, resident_id, event_id, status, created_at) VALUES (?, ?, ?, 'registered', ?)"
  ).run(id, residentId, eventId, now);

  return true;
}

export function getEventsForMonth(year: number, month: number): Event[] {
  const db = getDb();
  const startOfMonth = Math.floor(new Date(year, month - 1, 1).getTime() / 1000);
  const endOfMonth = Math.floor(new Date(year, month, 0, 23, 59, 59).getTime() / 1000);

  return db
    .prepare(
      `SELECT events.*, communities.name as community_name
       FROM events
       LEFT JOIN communities ON events.community_id = communities.id
       WHERE events.starts_at >= ? AND events.starts_at <= ?
       ORDER BY events.starts_at ASC`
    )
    .all(startOfMonth, endOfMonth) as Event[];
}
