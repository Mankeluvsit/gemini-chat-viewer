import { NextRequest, NextResponse } from "next/server";
import { starRepo, unstarRepo } from "@/lib/github";

export async function PUT(request: NextRequest) {
  try {
    const { owner, repo } = await request.json();
    await starRepo(owner, repo);
    return NextResponse.json({ starred: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to star repo" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { owner, repo } = await request.json();
    await unstarRepo(owner, repo);
    return NextResponse.json({ starred: false });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to unstar repo" },
      { status: 500 }
    );
  }
}
