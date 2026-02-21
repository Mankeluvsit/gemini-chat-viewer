import { NextRequest, NextResponse } from "next/server";
import { getBranches } from "@/lib/github";

type Params = { params: Promise<{ owner: string; repo: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  try {
    const branches = await getBranches(owner, repo);
    return NextResponse.json(branches);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch branches" },
      { status: 500 }
    );
  }
}
