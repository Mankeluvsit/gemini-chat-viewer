import { Suspense } from "react";
import { getBranches, getRepo } from "@/lib/github";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IconGitBranch, IconShieldCheck } from "@tabler/icons-react";

interface BranchesPageProps {
  params: Promise<{ owner: string; repo: string }>;
}

async function BranchesContent({ owner, repo }: { owner: string; repo: string }) {
  const [branches, repoData] = await Promise.all([
    getBranches(owner, repo),
    getRepo(owner, repo),
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Branches ({branches.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {branches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No branches found</p>
        ) : (
          <div className="flex flex-col gap-2">
            {branches.map((branch) => (
              <div
                key={branch.name}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center gap-2">
                  <IconGitBranch className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{branch.name}</span>
                  {branch.name === repoData.default_branch && (
                    <Badge variant="secondary" className="text-[10px]">
                      default
                    </Badge>
                  )}
                  {branch.protected && (
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <IconShieldCheck className="h-3 w-3" />
                      protected
                    </Badge>
                  )}
                </div>
                <code className="text-xs text-muted-foreground font-mono">
                  {branch.commit.sha.slice(0, 7)}
                </code>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function BranchesPage({ params }: BranchesPageProps) {
  const { owner, repo } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
      <BranchesContent owner={owner} repo={repo} />
    </Suspense>
  );
}
