import { NextRequest, NextResponse } from "next/server";
import { getComplianceOverview } from "@/lib/queries/compliance";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get("community_id") || undefined;

  const requirements = getComplianceOverview(communityId);
  return NextResponse.json(requirements);
}
