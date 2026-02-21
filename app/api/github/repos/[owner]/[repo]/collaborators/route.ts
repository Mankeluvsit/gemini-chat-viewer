import { NextRequest, NextResponse } from "next/server";
import { getCollaborators, addCollaborator } from "@/lib/github";

type Params = { params: Promise<{ owner: string; repo: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  try {
    const collaborators = await getCollaborators(owner, repo);
    return NextResponse.json(collaborators);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch collaborators" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  try {
    const { username, permission } = await request.json();
    await addCollaborator(owner, repo, username, permission);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add collaborator" },
      { status: 500 }
    );
  }
}
