"use client";

import { useMemo } from "react";
import type { GitHubRepo } from "@/lib/github";

interface RepoHeatmapProps {
  repos: GitHubRepo[];
}

export function RepoHeatmap({ repos }: RepoHeatmapProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const now = useMemo(() => Date.now(), []);

  return (
    <>
      <div className="grid grid-cols-7 gap-1">
        {repos.slice(0, 35).map((repo, i) => {
          const daysSinceUpdate = Math.floor(
            (now - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          let opacity = "opacity-10";
          if (daysSinceUpdate < 1) opacity = "opacity-100";
          else if (daysSinceUpdate < 7) opacity = "opacity-80";
          else if (daysSinceUpdate < 30) opacity = "opacity-50";
          else if (daysSinceUpdate < 90) opacity = "opacity-30";

          return (
            <div
              key={i}
              className={`h-4 w-full rounded-sm bg-primary ${opacity}`}
              title={`${repo.name}: updated ${daysSinceUpdate}d ago`}
            />
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Each square represents a repo. Brighter = more recently updated.
      </p>
    </>
  );
}
