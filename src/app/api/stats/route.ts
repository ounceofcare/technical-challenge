import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getOverdueRequirements } from "@/lib/queries/compliance";
import { getUpcomingEvents } from "@/lib/queries/events";

export async function GET() {
  const db = getDb();

  const totalResidents = db
    .prepare("SELECT COUNT(*) as count FROM residents WHERE deleted_at IS NULL")
    .get() as { count: number | bigint };

  const totalCommunities = db
    .prepare("SELECT COUNT(*) as count FROM communities")
    .get() as { count: number | bigint };

  const upcomingEvents = getUpcomingEvents(100);
  const overdueRequirements = getOverdueRequirements();

  const complianceRates = db
    .prepare(
      `SELECT c.name as community_name,
              (COUNT(DISTINCT cf.resident_id) / (SELECT COUNT(*) FROM residents r WHERE r.community_id = c.id)) * 100 as rate
       FROM communities c
       JOIN compliance_requirements cr ON c.id = cr.community_id
       JOIN compliance_fulfillments cf ON cr.id = cf.requirement_id
       GROUP BY c.id`
    )
    .all() as { community_name: string; rate: number }[];

  return NextResponse.json({
    totalResidents: Number(totalResidents.count),
    totalCommunities: Number(totalCommunities.count),
    upcomingEvents: upcomingEvents.length,
    overdueCompliance: overdueRequirements.length,
    complianceRates,
  });
}
