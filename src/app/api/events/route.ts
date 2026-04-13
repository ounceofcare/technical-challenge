import { NextRequest, NextResponse } from "next/server";
import { getEvents, createEvent } from "@/lib/queries/events";
import { parseIntParam } from "@/lib/utils";
import { validateRequired } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseIntParam(searchParams.get("page"), 1);
  const pageSize = parseIntParam(searchParams.get("pageSize"), 20);
  const community_id = searchParams.get("community_id") || undefined;
  const event_type = searchParams.get("event_type") || undefined;
  const timeRange = (searchParams.get("timeRange") as "upcoming" | "past" | "all") || "all";

  const result = getEvents({ page, pageSize, community_id, event_type, timeRange });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const missing = validateRequired(body, ["title", "community_id", "starts_at", "ends_at"]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const event = createEvent(body);
  return NextResponse.json(event, { status: 201 });
}
