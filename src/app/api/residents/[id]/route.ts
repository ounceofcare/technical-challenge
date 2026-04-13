import { NextRequest, NextResponse } from "next/server";
import { getResidentById, updateResident, deleteResident } from "@/lib/queries/residents";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const resident = getResidentById(id);

  if (!resident) {
    return NextResponse.json({ error: "Resident not found" }, { status: 404 });
  }

  return NextResponse.json(resident);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const data = {
    name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    community_id: "",
    status: "active",
    ...body,
  };

  const updated = updateResident(id, data);

  if (!updated) {
    return NextResponse.json({ error: "Resident not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteResident(id);

  if (!deleted) {
    return NextResponse.json({ error: "Resident not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
