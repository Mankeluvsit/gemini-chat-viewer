import Link from "next/link";
import {
  IconExternalLink,
  IconStar,
  IconGitFork,
  IconCircleFilled,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GitHubRepo } from "@/lib/github";
import { getLanguageColor } from "@/lib/language-colors";

interface RepoHeaderProps {
  repo: GitHubRepo;
}

export function RepoHeader({ repo }: RepoHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:underline"
            >
              Repositories
            </Link>
            <span className="text-sm text-muted-foreground">/</span>
            <h1 className="text-xl font-bold">{repo.name}</h1>
            <Badge
              variant={repo.private ? "secondary" : "outline"}
              className="text-xs"
            >
              {repo.private ? "Private" : "Public"}
            </Badge>
            {repo.archived && (
              <Badge variant="secondary" className="text-xs">
                Archived
              </Badge>
            )}
            {repo.fork && (
              <Badge variant="secondary" className="text-xs">
                Fork
              </Badge>
            )}
          </div>
          {repo.description && (
            <p className="text-sm text-muted-foreground">{repo.description}</p>
          )}
        </div>
        <Button variant="outline" size="sm" asChild>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconExternalLink className="mr-1 h-3.5 w-3.5" />
            GitHub
          </a>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
          <IconStar className="h-4 w-4" />
          {repo.stargazers_count} stars
        </span>
        <span className="flex items-center gap-1">
          <IconGitFork className="h-4 w-4" />
          {repo.forks_count} forks
        </span>
        <span className="flex items-center gap-1">
          <IconAlertCircle className="h-4 w-4" />
          {repo.open_issues_count} open issues
        </span>
        {repo.license && (
          <span className="text-xs">{repo.license.name}</span>
        )}
      </div>

      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {repo.topics.map((topic) => (
            <Badge key={topic} variant="secondary" className="text-xs">
              {topic}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
