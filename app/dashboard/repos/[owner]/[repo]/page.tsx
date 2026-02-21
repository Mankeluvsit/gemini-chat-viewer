import { Suspense } from "react";
import { getLanguages, getCommits, getReadme, getRepo, getWorkflowRuns } from "@/lib/github";
import { LanguageChart } from "@/components/language-chart";
import { ReadmePreview } from "@/components/readme-preview";
import { HealthScore } from "@/components/health-score";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface OverviewPageProps {
  params: Promise<{ owner: string; repo: string }>;
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Skeleton className="h-[200px] rounded-xl" />
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-[200px] rounded-xl" />
        <Skeleton className="h-[200px] rounded-xl" />
      </div>
    </div>
  );
}

async function OverviewContent({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const [languages, commits, readme, repoData, actionsData] = await Promise.all([
    getLanguages(owner, repo),
    getCommits(owner, repo, 1, 10),
    getReadme(owner, repo),
    getRepo(owner, repo),
    getWorkflowRuns(owner, repo, 5).catch(() => ({ total_count: 0, workflow_runs: [] })),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* CI Status */}
        {actionsData.workflow_runs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">CI / GitHub Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {actionsData.workflow_runs.map((run) => (
                  <a
                    key={run.id}
                    href={run.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-accent text-sm"
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        run.conclusion === "success"
                          ? "bg-green-400"
                          : run.conclusion === "failure"
                          ? "bg-red-400"
                          : run.status === "in_progress"
                          ? "bg-yellow-400 animate-pulse"
                          : "bg-muted-foreground"
                      }`}
                    />
                    <span className="flex-1 truncate">{run.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {run.head_branch}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      #{run.run_number}
                    </span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Commits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Commits</CardTitle>
          </CardHeader>
          <CardContent>
            {commits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No commits yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {commits.map((commit) => (
                  <a
                    key={commit.sha}
                    href={commit.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-md p-2 hover:bg-accent"
                  >
                    <Avatar className="mt-0.5 h-6 w-6">
                      <AvatarImage
                        src={commit.author?.avatar_url}
                        alt={commit.commit.author.name}
                      />
                      <AvatarFallback className="text-[10px]">
                        {commit.commit.author.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {commit.commit.message.split("\n")[0]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {commit.commit.author.name} committed{" "}
                        {new Date(commit.commit.author.date).toLocaleDateString()}
                      </p>
                    </div>
                    <code className="shrink-0 text-xs text-muted-foreground font-mono">
                      {commit.sha.slice(0, 7)}
                    </code>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* README */}
        {readme && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">README.md</CardTitle>
            </CardHeader>
            <CardContent>
              <ReadmePreview content={readme} />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {/* Health Score */}
        <Card>
          <CardContent className="pt-6">
            <HealthScore repo={repoData} hasReadme={!!readme} />
          </CardContent>
        </Card>

        {/* Languages */}
        <Card>
          <CardContent className="pt-6">
            <LanguageChart languages={languages} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default async function RepoOverviewPage({ params }: OverviewPageProps) {
  const { owner, repo } = await params;
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewContent owner={owner} repo={repo} />
    </Suspense>
  );
}
