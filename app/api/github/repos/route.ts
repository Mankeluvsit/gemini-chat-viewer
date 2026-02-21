import { NextRequest, NextResponse } from "next/server";
import { getRepos, createRepo } from "@/lib/github";

export async function GET() {
  try {
    const repos = await getRepos();
    return NextResponse.json(repos);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch repos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const repo = await createRepo(body);
    return NextResponse.json(repo, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create repo" },
      { status: 500 }
    );
  }
}
