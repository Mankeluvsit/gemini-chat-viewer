import { NextResponse } from "next/server";
import { getStarredRepos } from "@/lib/github";

export async function GET() {
  try {
    const repos = await getStarredRepos();
    return NextResponse.json(repos);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch starred repos" },
      { status: 500 }
    );
  }
}
