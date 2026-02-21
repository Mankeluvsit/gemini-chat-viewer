import { NextRequest, NextResponse } from "next/server";
import {
  searchCode,
  searchRepos,
  searchIssues,
  searchUsers,
  searchTopics,
  getUser,
} from "@/lib/github";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const type = searchParams.get("type") || "code";
  const sort = searchParams.get("sort") || undefined;
  const order = searchParams.get("order") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const scope = searchParams.get("scope") || "global"; // "global" or "my"

  if (!q) {
    return NextResponse.json({ total_count: 0, items: [] });
  }

  try {
    switch (type) {
      case "code": {
        if (scope === "my") {
          const user = await getUser();
          const results = await searchCode(q, user.login, page);
          return NextResponse.json(results);
        }
        // For global code search, we still search (but without user filter)
        const results = await searchCode(q, "", page);
        return NextResponse.json(results);
      }
      case "repos": {
        let query = q;
        if (scope === "my") {
          const user = await getUser();
          query = `${q} user:${user.login}`;
        }
        const results = await searchRepos(query, sort, order, page);
        return NextResponse.json(results);
      }
      case "issues": {
        let query = q;
        if (scope === "my") {
          const user = await getUser();
          query = `${q} involves:${user.login}`;
        }
        const results = await searchIssues(query, sort, order, page);
        return NextResponse.json(results);
      }
      case "users": {
        const results = await searchUsers(q, page);
        return NextResponse.json(results);
      }
      case "topics": {
        const results = await searchTopics(q, page);
        return NextResponse.json(results);
      }
      default:
        return NextResponse.json({ error: "Invalid search type" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Search failed" },
      { status: 500 }
    );
  }
}
