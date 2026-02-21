import { Suspense } from "react";
import { getLanguages, getCommits } from "@/lib/github";
import { LanguageChart } from "@/components/language-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface OverviewPageProps {
  params: Promise<{ owner: string; repo: string }>;
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Skeleton className="h-[200px] rounded-xl" />
      </div>
      <Skeleton className="h-[200px] rounded-xl" />
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
  const [languages, commits] = await Promise.all([
    getLanguages(owner, repo),
    getCommits(owner, repo, 1, 10),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
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
                        {new Date(
                          commit.commit.author.date
                        ).toLocaleDateString()}
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
      </div>

      <div>
        <Card>
          <CardContent className="pt-6">
            <LanguageChart languages={languages} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default async function RepoOverviewPage({
  params,
}: OverviewPageProps) {
  const { owner, repo } = await params;
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewContent owner={owner} repo={repo} />
    </Suspense>
  );
}
