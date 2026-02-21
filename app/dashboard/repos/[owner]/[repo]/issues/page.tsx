import { Suspense } from "react";
import { getIssues } from "@/lib/github";
import { IssuesTable } from "@/components/issues-table";
import { CreateIssueDialog } from "@/components/create-issue-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IssuesPageProps {
  params: Promise<{ owner: string; repo: string }>;
  searchParams: Promise<{ state?: string }>;
}

async function IssuesContent({
  owner,
  repo,
  state,
}: {
  owner: string;
  repo: string;
  state: "open" | "closed" | "all";
}) {
  const issues = await getIssues(owner, repo, state);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">
          Issues ({issues.length})
        </CardTitle>
        <CreateIssueDialog owner={owner} repo={repo} />
      </CardHeader>
      <CardContent>
        <IssuesTable issues={issues} owner={owner} repo={repo} />
      </CardContent>
    </Card>
  );
}

export default async function IssuesPage({
  params,
  searchParams,
}: IssuesPageProps) {
  const { owner, repo } = await params;
  const { state } = await searchParams;
  const issueState = (state as "open" | "closed" | "all") || "open";

  return (
    <Suspense
      fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}
    >
      <IssuesContent owner={owner} repo={repo} state={issueState} />
    </Suspense>
  );
}
