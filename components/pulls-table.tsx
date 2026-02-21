import {
  IconGitPullRequest,
  IconGitMerge,
  IconGitPullRequestClosed,
  IconMessageCircle,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { GitHubPullRequest } from "@/lib/github";

interface PullsTableProps {
  pulls: GitHubPullRequest[];
}

function getPRIcon(pr: GitHubPullRequest) {
  if (pr.merged_at) {
    return <IconGitMerge className="h-4 w-4 text-purple-500" />;
  }
  if (pr.state === "closed") {
    return <IconGitPullRequestClosed className="h-4 w-4 text-red-500" />;
  }
  return <IconGitPullRequest className="h-4 w-4 text-green-500" />;
}

function getPRStatus(pr: GitHubPullRequest): string {
  if (pr.merged_at) return "Merged";
  if (pr.state === "closed") return "Closed";
  if (pr.draft) return "Draft";
  return "Open";
}

export function PullsTable({ pulls }: PullsTableProps) {
  if (pulls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No pull requests found
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">Status</TableHead>
          <TableHead>Title</TableHead>
          <TableHead className="w-[120px]">Branch</TableHead>
          <TableHead className="w-[80px]">Labels</TableHead>
          <TableHead className="w-[80px] text-center">Comments</TableHead>
          <TableHead className="w-[120px]">Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pulls.map((pr) => (
          <TableRow key={pr.id}>
            <TableCell>{getPRIcon(pr)}</TableCell>
            <TableCell>
              <a
                href={pr.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
              >
                {pr.title}
              </a>
              <p className="text-xs text-muted-foreground">
                #{pr.number} by {pr.user.login}
                {pr.draft && (
                  <Badge variant="secondary" className="ml-2 text-[10px]">
                    Draft
                  </Badge>
                )}
              </p>
            </TableCell>
            <TableCell>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {pr.head.ref}
              </code>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {pr.labels.slice(0, 2).map((label) => (
                  <Badge
                    key={label.id}
                    variant="outline"
                    className="text-[10px]"
                    style={{
                      borderColor: `#${label.color}`,
                      color: `#${label.color}`,
                    }}
                  >
                    {label.name}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <span className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <IconMessageCircle className="h-3 w-3" />
                {pr.comments}
              </span>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {new Date(pr.updated_at).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
