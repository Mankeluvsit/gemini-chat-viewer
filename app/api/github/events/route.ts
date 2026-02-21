import { NextResponse } from "next/server";
import { getUserEvents, getUser } from "@/lib/github";

export async function GET() {
  try {
    const user = await getUser();
    const events = await getUserEvents(user.login, 1, 50);
    return NextResponse.json(events);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch events" },
      { status: 500 }
    );
  }
}
