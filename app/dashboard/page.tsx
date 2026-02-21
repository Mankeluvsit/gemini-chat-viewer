import { Suspense } from "react";
import { getRepos } from "@/lib/github";
import { StatsCards } from "@/components/stats-cards";
import { RepoGrid } from "@/components/repo-grid";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { CreateRepoDialog } from "@/components/create-repo-dialog";
import { LanguageChart } from "@/components/language-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardPageProps {
  searchParams: Promise<{
    q?: string;
    language?: string;
    visibility?: string;
    sort?: string;
  }>;
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[110px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[160px] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: {
    q?: string;
    language?: string;
    visibility?: string;
    sort?: string;
  };
}) {
  const allRepos = await getRepos();

  // Extract unique languages for filter
  const languages = [
    ...new Set(allRepos.map((r) => r.language).filter(Boolean)),
  ] as string[];

  // Aggregate language counts for chart
  const langCounts: Record<string, number> = {};
  allRepos.forEach((r) => {
    if (r.language) {
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    }
  });

  // Apply filters
  let filtered = allRepos;

  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    );
  }

  if (searchParams.language && searchParams.language !== "all") {
    filtered = filtered.filter((r) => r.language === searchParams.language);
  }

  if (searchParams.visibility && searchParams.visibility !== "all") {
    filtered = filtered.filter((r) =>
      searchParams.visibility === "private" ? r.private : !r.private
    );
  }

  // Apply sort
  if (searchParams.sort === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (searchParams.sort === "stars") {
    filtered.sort((a, b) => b.stargazers_count - a.stargazers_count);
  } else if (searchParams.sort === "created") {
    filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <StatsCards repos={allRepos} />

      {/* Language Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Language Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <LanguageChart languages={langCounts} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <SearchFilterBar languages={languages} />
        </div>
        <CreateRepoDialog />
      </div>
      <RepoGrid repos={filtered} />
    </div>
  );
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent searchParams={params} />
    </Suspense>
  );
}
