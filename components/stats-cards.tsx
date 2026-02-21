import {
  IconGitFork,
  IconStar,
  IconGitBranch,
  IconEye,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GitHubRepo } from "@/lib/github";

interface StatsCardsProps {
  repos: GitHubRepo[];
}

export function StatsCards({ repos }: StatsCardsProps) {
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);
  const totalIssues = repos.reduce((sum, r) => sum + r.open_issues_count, 0);

  // Find the most common language
  const langCounts: Record<string, number> = {};
  repos.forEach((r) => {
    if (r.language) {
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    }
  });
  const topLanguage =
    Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const stats = [
    {
      title: "Total Repos",
      value: repos.length,
      icon: IconGitBranch,
      description: `${repos.filter((r) => r.private).length} private`,
    },
    {
      title: "Total Stars",
      value: totalStars,
      icon: IconStar,
      description: "across all repos",
    },
    {
      title: "Total Forks",
      value: totalForks,
      icon: IconGitFork,
      description: "across all repos",
    },
    {
      title: "Open Issues",
      value: totalIssues,
      icon: IconEye,
      description: `Top language: ${topLanguage}`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
