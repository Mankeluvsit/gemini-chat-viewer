import { NextRequest, NextResponse } from "next/server";
import { getPulls } from "@/lib/github";

type Params = { params: Promise<{ owner: string; repo: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  const { searchParams } = new URL(request.url);
  const state = (searchParams.get("state") as "open" | "closed" | "all") || "open";

  try {
    const pulls = await getPulls(owner, repo, state);
    return NextResponse.json(pulls);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch pull requests" },
      { status: 500 }
    );
  }
}
