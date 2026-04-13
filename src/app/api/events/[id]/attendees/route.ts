import { NextRequest, NextResponse } from "next/server";
import { getEventAttendees, addAttendee } from "@/lib/queries/events";
import { validateRequired } from "@/lib/validators";
import { isValidId } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const attendees = getEventAttendees(id);
  return NextResponse.json(attendees);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const body = await request.json();

  const missing = validateRequired(body, ["resident_id"]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  if (!isValidId(body.resident_id)) {
    return NextResponse.json(
      { error: "Invalid resident ID" },
      { status: 400 }
    );
  }

  const success = addAttendee(eventId, body.resident_id);

  if (!success) {
    return NextResponse.json(
      { error: "Could not add attendee. Event may be at capacity or not found." },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
