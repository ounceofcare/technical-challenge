import { NextRequest, NextResponse } from "next/server";
import { fulfillRequirement } from "@/lib/queries/compliance";
import { validateRequired } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const missing = validateRequired(body, ["requirement_id", "resident_id"]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const fulfillment = fulfillRequirement(body);
  return NextResponse.json(fulfillment, { status: 201 });
}
