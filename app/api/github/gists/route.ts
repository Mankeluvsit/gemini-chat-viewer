import { NextRequest, NextResponse } from "next/server";
import { getGists, createGist } from "@/lib/github";

export async function GET() {
  try {
    const gists = await getGists();
    return NextResponse.json(gists);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch gists" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const gist = await createGist(body);
    return NextResponse.json(gist, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create gist" },
      { status: 500 }
    );
  }
}
