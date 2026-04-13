import { getDb } from "@/lib/db";
import type { ComplianceRequirementWithStats, ComplianceFulfillment } from "@/types";

export function getComplianceOverview(communityId?: string): ComplianceRequirementWithStats[] {
  const db = getDb();

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (communityId) {
    conditions.push("cr.community_id = ?");
    params.push(communityId);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const rows = db
    .prepare(
      `SELECT cr.*,
              c.name as community_name,
              COUNT(DISTINCT cf.resident_id) as fulfilled_count,
              (SELECT COUNT(*) FROM residents r WHERE r.community_id = cr.community_id) as total_residents
       FROM compliance_requirements cr
       JOIN communities c ON cr.community_id = c.id
       JOIN compliance_fulfillments cf ON cr.id = cf.requirement_id
       ${whereClause}
       GROUP BY cr.id
       ORDER BY cr.due_date ASC`
    )
    .all(...params) as (ComplianceRequirementWithStats & {
      fulfilled_count: number;
      total_residents: number;
    })[];

  return rows.map((row) => ({
    ...row,
    fulfilled_count: Number(row.fulfilled_count),
    total_residents: Number(row.total_residents),
    fulfillment_rate:
      Number(row.total_residents) > 0
        ? (Number(row.fulfilled_count) / Number(row.total_residents)) * 100
        : 0,
  }));
}

export function getOverdueRequirements(): ComplianceRequirementWithStats[] {
  const db = getDb();

  const rows = db
    .prepare(
      `SELECT cr.*,
              c.name as community_name,
              COUNT(DISTINCT cf.resident_id) as fulfilled_count,
              (SELECT COUNT(*) FROM residents r WHERE r.community_id = cr.community_id) as total_residents
       FROM compliance_requirements cr
       JOIN communities c ON cr.community_id = c.id
       LEFT JOIN compliance_fulfillments cf ON cr.id = cf.requirement_id
       WHERE cr.due_date < strftime('%s', 'now')
       GROUP BY cr.id
       ORDER BY cr.due_date ASC`
    )
    .all() as (ComplianceRequirementWithStats & {
      fulfilled_count: number;
      total_residents: number;
    })[];

  return rows.map((row) => ({
    ...row,
    fulfilled_count: Number(row.fulfilled_count),
    total_residents: Number(row.total_residents),
    fulfillment_rate:
      Number(row.total_residents) > 0
        ? (Number(row.fulfilled_count) / Number(row.total_residents)) * 100
        : 0,
  }));
}

export function getComplianceStats(): {
  community_name: string;
  rate: number;
}[] {
  const db = getDb();

  // Get per-requirement rates, then average per community
  const requirements = getComplianceOverview();

  const communityRates: Record<string, number[]> = {};
  for (const req of requirements) {
    if (!communityRates[req.community_name]) {
      communityRates[req.community_name] = [];
    }
    communityRates[req.community_name].push(req.fulfillment_rate);
  }

  // Average compliance rate per community
  return Object.entries(communityRates).map(([community_name, rates]) => ({
    community_name,
    rate: rates.reduce((sum, r) => sum + r, 0) / rates.length,
  }));
}

export function fulfillRequirement(data: {
  requirement_id: string;
  resident_id: string;
  event_id?: string;
  notes?: string;
}): ComplianceFulfillment {
  const db = getDb();
  const { nanoid } = require("nanoid") as { nanoid: () => string };
  const id = nanoid();
  const now = Math.floor(Date.now() / 1000);

  db.prepare(
    `INSERT INTO compliance_fulfillments (id, requirement_id, resident_id, event_id, fulfilled_at, status, notes, created_at)
     VALUES (?, ?, ?, ?, ?, 'completed', ?, ?)`
  ).run(id, data.requirement_id, data.resident_id, data.event_id || null, now, data.notes || null, now);

  return db
    .prepare("SELECT * FROM compliance_fulfillments WHERE id = ?")
    .get(id) as ComplianceFulfillment;
}
