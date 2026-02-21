import { Suspense } from "react";
import { getCommitActivity } from "@/lib/github";
import { CommitChart } from "@/components/commit-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityPageProps {
  params: Promise<{ owner: string; repo: string }>;
}

async function ActivityContent({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  let activity: Awaited<ReturnType<typeof getCommitActivity>> = [];
  try {
    activity = await getCommitActivity(owner, repo);
  } catch {
    activity = [];
  }

  const totalCommits = activity.reduce(
    (sum: number, w: { total: number }) => sum + w.total,
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Commits (52 weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCommits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Commits / Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activity.length > 0
                ? (totalCommits / activity.length).toFixed(1)
                : "0"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Active Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activity.length > 0
                ? Math.max(...activity.map((w: { total: number }) => w.total))
                : "0"}{" "}
              commits
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="pt-6">
          <CommitChart activity={activity} />
        </CardContent>
      </Card>
    </div>
  );
}

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { owner, repo } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[100px] rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[250px] rounded-xl" />
        </div>
      }
    >
      <ActivityContent owner={owner} repo={repo} />
    </Suspense>
  );
}
