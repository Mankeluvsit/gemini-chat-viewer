import { NextRequest, NextResponse } from "next/server";
import { getIssues, createIssue } from "@/lib/github";

type Params = { params: Promise<{ owner: string; repo: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  const { searchParams } = new URL(request.url);
  const state = (searchParams.get("state") as "open" | "closed" | "all") || "open";

  try {
    const issues = await getIssues(owner, repo, state);
    return NextResponse.json(issues);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch issues" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  try {
    const body = await request.json();
    const issue = await createIssue(owner, repo, body);
    return NextResponse.json(issue, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create issue" },
      { status: 500 }
    );
  }
}
