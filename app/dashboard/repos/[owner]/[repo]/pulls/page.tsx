import { Suspense } from "react";
import { getPulls } from "@/lib/github";
import { PullsTable } from "@/components/pulls-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PullsPageProps {
  params: Promise<{ owner: string; repo: string }>;
  searchParams: Promise<{ state?: string }>;
}

async function PullsContent({
  owner,
  repo,
  state,
}: {
  owner: string;
  repo: string;
  state: "open" | "closed" | "all";
}) {
  const pulls = await getPulls(owner, repo, state);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Pull Requests ({pulls.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PullsTable pulls={pulls} />
      </CardContent>
    </Card>
  );
}

export default async function PullsPage({
  params,
  searchParams,
}: PullsPageProps) {
  const { owner, repo } = await params;
  const { state } = await searchParams;
  const prState = (state as "open" | "closed" | "all") || "open";

  return (
    <Suspense
      fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}
    >
      <PullsContent owner={owner} repo={repo} state={prState} />
    </Suspense>
  );
}
