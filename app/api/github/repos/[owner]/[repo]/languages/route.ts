import { NextRequest, NextResponse } from "next/server";
import { getLanguages } from "@/lib/github";

type Params = { params: Promise<{ owner: string; repo: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  try {
    const languages = await getLanguages(owner, repo);
    return NextResponse.json(languages);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch languages" },
      { status: 500 }
    );
  }
}
