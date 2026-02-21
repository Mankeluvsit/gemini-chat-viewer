import { NextRequest, NextResponse } from "next/server";
import { deleteGist } from "@/lib/github";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await deleteGist(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete gist" },
      { status: 500 }
    );
  }
}
