import { NextRequest, NextResponse } from "next/server";
import { getDependabotAlerts } from "@/lib/github";

type Params = { params: Promise<{ owner: string; repo: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { owner, repo } = await params;
  try {
    const alerts = await getDependabotAlerts(owner, repo);
    return NextResponse.json(alerts);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
