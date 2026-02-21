import { NextRequest, NextResponse } from "next/server";
import { updateIssue } from "@/lib/github";

type Params = { params: Promise<{ owner: string; repo: string; number: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { owner, repo, number } = await params;
  try {
    const body = await request.json();
    const issue = await updateIssue(owner, repo, parseInt(number, 10), body);
    return NextResponse.json(issue);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update issue" },
      { status: 500 }
    );
  }
}
