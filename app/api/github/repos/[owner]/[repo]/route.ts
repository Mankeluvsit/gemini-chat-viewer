import { NextRequest, NextResponse } from "next/server";
import { getRepo, updateRepo, deleteRepo } from "@/lib/github";

type Params = { params: Promise<{ owner: string; repo: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  try {
    const data = await getRepo(owner, repo);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch repo" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  try {
    const body = await request.json();
    const data = await updateRepo(owner, repo, body);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update repo" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  try {
    await deleteRepo(owner, repo);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete repo" },
      { status: 500 }
    );
  }
}
