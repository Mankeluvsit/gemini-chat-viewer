import { NextResponse } from "next/server";
import { getNotifications } from "@/lib/github";

export async function GET() {
  try {
    const notifications = await getNotifications();
    return NextResponse.json(notifications);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
