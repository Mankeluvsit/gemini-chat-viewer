import Link from "next/link";
import { IconStar, IconGitFork, IconCircleFilled } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GitHubRepo } from "@/lib/github";
import { getLanguageColor } from "@/lib/language-colors";

interface RepoCardProps {
  repo: GitHubRepo;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
}

export function RepoCard({ repo }: RepoCardProps) {
  return (
    <Link href={`/dashboard/repos/${repo.owner.login}/${repo.name}`}>
      <Card className="h-full transition-colors hover:border-primary/50 hover:bg-accent/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-tight line-clamp-1">
              {repo.name}
            </CardTitle>
            <Badge variant={repo.private ? "secondary" : "outline"} className="shrink-0 text-xs">
              {repo.private ? "Private" : "Public"}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2 text-xs">
            {repo.description || "No description"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {repo.language && (
              <span className="flex items-center gap-1">
                <IconCircleFilled
                  className="h-3 w-3"
                  style={{ color: getLanguageColor(repo.language) }}
                />
                {repo.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <IconStar className="h-3 w-3" />
              {repo.stargazers_count}
            </span>
            <span className="flex items-center gap-1">
              <IconGitFork className="h-3 w-3" />
              {repo.forks_count}
            </span>
            <span className="ml-auto">{timeAgo(repo.updated_at)}</span>
          </div>
          {repo.topics && repo.topics.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {repo.topics.slice(0, 3).map((topic) => (
                <Badge key={topic} variant="secondary" className="text-[10px] px-1.5 py-0">
                  {topic}
                </Badge>
              ))}
              {repo.topics.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{repo.topics.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
