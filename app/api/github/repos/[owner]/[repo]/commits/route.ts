import { NextRequest, NextResponse } from "next/server";
import { getCommitActivity } from "@/lib/github";

type Params = { params: Promise<{ owner: string; repo: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  try {
    const activity = await getCommitActivity(owner, repo);
    return NextResponse.json(activity);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch commit activity" },
      { status: 500 }
    );
  }
}
