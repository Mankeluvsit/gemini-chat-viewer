import { NextRequest, NextResponse } from "next/server";
import { getRepoTree } from "@/lib/github";

type Params = { params: Promise<{ owner: string; repo: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  const { searchParams } = new URL(request.url);
  const branch = searchParams.get("branch") || "HEAD";

  try {
    const tree = await getRepoTree(owner, repo, branch);
    return NextResponse.json(tree);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch tree" },
      { status: 500 }
    );
  }
}
