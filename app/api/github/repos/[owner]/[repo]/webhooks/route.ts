import { NextRequest, NextResponse } from "next/server";
import { getWebhooks } from "@/lib/github";

type Params = { params: Promise<{ owner: string; repo: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  try {
    const webhooks = await getWebhooks(owner, repo);
    return NextResponse.json(webhooks);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch webhooks" },
      { status: 500 }
    );
  }
}
