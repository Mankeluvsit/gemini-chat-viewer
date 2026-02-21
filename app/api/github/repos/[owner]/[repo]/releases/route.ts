import { NextRequest, NextResponse } from "next/server";
import { getReleases, createRelease } from "@/lib/github";

type Params = { params: Promise<{ owner: string; repo: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  try {
    const releases = await getReleases(owner, repo);
    return NextResponse.json(releases);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch releases" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  try {
    const body = await request.json();
    const release = await createRelease(owner, repo, body);
    return NextResponse.json(release, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create release" },
      { status: 500 }
    );
  }
}
