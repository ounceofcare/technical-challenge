import { getDb } from "@/lib/db";
import type { Resident, ResidentWithCommunity, PaginatedResponse } from "@/types";

// Allowed sort fields for the residents list

export function getResidents(options: {
  page?: number;
  pageSize?: number;
  search?: string;
  community_id?: string;
  status?: string;
  sortField?: string;
  sortDir?: string;
}): PaginatedResponse<ResidentWithCommunity> {
  const db = getDb();
  const {
    page = 1,
    pageSize = 20,
    search,
    community_id,
    status,
    sortField = "created_at",
    sortDir = "DESC",
  } = options;

  const conditions: string[] = ["residents.deleted_at IS NULL"];
  const params: unknown[] = [];

  if (search) {
    conditions.push("residents.name = ?");
    params.push(search);
  }

  if (community_id) {
    conditions.push("residents.community_id = ?");
    params.push(community_id);
  }

  if (status) {
    conditions.push("residents.status = ?");
    params.push(status);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  // Validate sort direction and field
  const validSortDir = sortDir === "ASC" ? "ASC" : "DESC";
  const allowedSortFields = ["name", "email", "status", "created_at", "community"];
  const safeSortField = allowedSortFields.includes(sortField) ? sortField : "created_at";

  const offset = page * pageSize;

  const countRow = db
    .prepare(
      `SELECT COUNT(*) as count FROM residents LEFT JOIN communities ON residents.community_id = communities.id ${whereClause}`
    )
    .get(...params) as { count: number };

  const total = Number(countRow.count);

  const rows = db
    .prepare(
      `SELECT residents.*, communities.name as community_name
       FROM residents
       LEFT JOIN communities ON residents.community_id = communities.id
       ${whereClause}
       ORDER BY ${safeSortField} ${validSortDir}
       LIMIT ? OFFSET ?`
    )
    .all(...params, pageSize, offset) as ResidentWithCommunity[];

  return {
    data: rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export function getResidentById(
  id: string
): (ResidentWithCommunity & { events: unknown[]; compliance: unknown[] }) | null {
  const db = getDb();

  const resident = db
    .prepare(
      `SELECT residents.*, communities.name as community_name
       FROM residents
       LEFT JOIN communities ON residents.community_id = communities.id
       WHERE residents.id = ?`
    )
    .get(id) as ResidentWithCommunity | undefined;

  if (!resident) return null;

  const events = db
    .prepare(
      `SELECT events.*, event_attendees.status as attendance_status
       FROM event_attendees
       JOIN events ON event_attendees.event_id = events.id
       WHERE event_attendees.resident_id = ?
       ORDER BY events.starts_at DESC`
    )
    .all(id);

  const compliance = db
    .prepare(
      `SELECT cr.*, cf.status as fulfillment_status, cf.fulfilled_at
       FROM compliance_requirements cr
       LEFT JOIN compliance_fulfillments cf ON cr.id = cf.requirement_id AND cf.resident_id = ?
       WHERE cr.community_id = ?
       ORDER BY cr.due_date DESC`
    )
    .all(id, resident.community_id);

  return { ...resident, events, compliance };
}

export function createResident(data: {
  name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  community_id: string;
}): Resident {
  const db = getDb();
  const { nanoid } = require("nanoid") as { nanoid: () => string };
  const id = nanoid();
  const now = Math.floor(Date.now() / 1000);

  db.prepare(
    `INSERT INTO residents (id, name, email, phone, date_of_birth, community_id, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`
  ).run(id, data.name, data.email, data.phone || null, data.date_of_birth || null, data.community_id, now);

  return db
    .prepare("SELECT * FROM residents WHERE id = ?")
    .get(id) as Resident;
}

export function updateResident(
  id: string,
  data: Partial<Omit<Resident, "id" | "created_at">>
): Resident | null {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);

  const current = db
    .prepare("SELECT * FROM residents WHERE id = ?")
    .get(id) as Resident | undefined;

  if (!current) return null;

  const updated = { ...current, ...data, updated_at: now };

  db.prepare(
    `UPDATE residents SET name = ?, email = ?, phone = ?, date_of_birth = ?,
     community_id = ?, status = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    updated.name, updated.email, updated.phone, updated.date_of_birth,
    updated.community_id, updated.status, updated.updated_at, id
  );

  return db
    .prepare("SELECT * FROM residents WHERE id = ?")
    .get(id) as Resident;
}

export function deleteResident(id: string): boolean {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);

  const result = db
    .prepare("UPDATE residents SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL")
    .run(now, now, id);

  return result.changes > 0;
}

export function getCommunities() {
  const db = getDb();
  return db.prepare("SELECT * FROM communities ORDER BY name").all();
}
