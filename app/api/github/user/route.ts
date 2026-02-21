import { NextResponse } from "next/server";
import { getUser } from "@/lib/github";

export async function GET() {
  try {
    const user = await getUser();
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch user" },
      { status: 500 }
    );
  }
}
