import { Suspense } from "react";
import { getStarredRepos } from "@/lib/github";
import { RepoGrid } from "@/components/repo-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { IconStar } from "@tabler/icons-react";

async function StarredContent() {
  const repos = await getStarredRepos(1, 50);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <IconStar className="h-5 w-5 text-yellow-400" />
        <h1 className="text-xl font-bold">Starred Repositories</h1>
        <span className="text-sm text-muted-foreground">({repos.length})</span>
      </div>
      <RepoGrid repos={repos} />
    </div>
  );
}

export default function StarredPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[160px] rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <StarredContent />
    </Suspense>
  );
}
