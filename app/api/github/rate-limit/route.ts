import { NextResponse } from "next/server";
import { getRateLimit } from "@/lib/github";

export async function GET() {
  try {
    const rateLimit = await getRateLimit();
    return NextResponse.json(rateLimit);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch rate limit" },
      { status: 500 }
    );
  }
}
