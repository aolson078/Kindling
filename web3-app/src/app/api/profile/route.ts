import { NextRequest, NextResponse } from "next/server";

type ProfileRecord = { cid: string; attestationId: string };

const profiles = new Map<string, ProfileRecord>();

export async function POST(req: NextRequest) {
  const { userId, cid, attestationId } = await req.json();
  if (!userId || !cid || !attestationId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  profiles.set(userId, { cid, attestationId });
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId || !profiles.has(userId)) {
    return NextResponse.json({ found: false });
  }
  return NextResponse.json({ found: true, profile: profiles.get(userId) });
}
