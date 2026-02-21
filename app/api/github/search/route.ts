import { NextRequest, NextResponse } from "next/server";
import { searchCode, getUser } from "@/lib/github";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1", 10);

  if (!q) {
    return NextResponse.json({ total_count: 0, items: [] });
  }

  try {
    const user = await getUser();
    const results = await searchCode(q, user.login, page);
    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to search" },
      { status: 500 }
    );
  }
}
