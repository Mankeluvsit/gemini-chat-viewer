import { NextRequest, NextResponse } from "next/server";
import { getFileContent, updateFileContent, createFileContent, deleteFileContent } from "@/lib/github";

type Params = { params: Promise<{ owner: string; repo: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  const ref = searchParams.get("ref") || undefined;

  if (!path) {
    return NextResponse.json({ error: "path is required" }, { status: 400 });
  }

  try {
    const file = await getFileContent(owner, repo, path, ref);
    return NextResponse.json(file);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch file" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  try {
    const body = await request.json();
    const { path, message, content, sha, branch } = body;

    if (sha) {
      // Update existing file
      const result = await updateFileContent(owner, repo, path, {
        message,
        content,
        sha,
        branch,
      });
      return NextResponse.json(result);
    } else {
      // Create new file
      const result = await createFileContent(owner, repo, path, {
        message,
        content,
        branch,
      });
      return NextResponse.json(result, { status: 201 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save file" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  try {
    const body = await request.json();
    const { path, message, sha, branch } = body;

    await deleteFileContent(owner, repo, path, { message, sha, branch });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete file" },
      { status: 500 }
    );
  }
}
