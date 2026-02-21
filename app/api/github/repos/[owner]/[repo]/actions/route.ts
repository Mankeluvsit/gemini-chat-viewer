import { NextRequest, NextResponse } from "next/server";
import { getWorkflowRuns } from "@/lib/github";

type Params = { params: Promise<{ owner: string; repo: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  try {
    const runs = await getWorkflowRuns(owner, repo);
    return NextResponse.json(runs);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch workflow runs" },
      { status: 500 }
    );
  }
}
