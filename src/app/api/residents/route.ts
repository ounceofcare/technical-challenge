import { NextRequest, NextResponse } from "next/server";
import { getResidents, createResident } from "@/lib/queries/residents";
import { parseIntParam } from "@/lib/utils";
import { validateRequired, validateEmail } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseIntParam(searchParams.get("page"), 1);
  const pageSize = parseIntParam(searchParams.get("pageSize"), 20);
  const search = searchParams.get("search") || undefined;
  const community_id = searchParams.get("community_id") || undefined;
  const status = searchParams.get("status") || undefined;
  const sortField = searchParams.get("sortField") || "created_at";
  const sortDir = searchParams.get("sortDir") || "DESC";

  const result = getResidents({
    page,
    pageSize,
    search,
    community_id,
    status,
    sortField,
    sortDir,
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const missing = validateRequired(body, ["name", "email", "community_id"]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  if (!validateEmail(body.email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  const resident = createResident(body);
  return NextResponse.json(resident, { status: 201 });
}
