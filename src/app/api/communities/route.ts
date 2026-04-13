import { NextResponse } from "next/server";
import { getCommunities } from "@/lib/queries/residents";

export async function GET() {
  const communities = getCommunities();
  return NextResponse.json(communities);
}
