"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconCircleCheck,
  IconCircleDot,
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
import { Button } from "@/components/ui/button";
import type { GitHubIssue } from "@/lib/github";

interface IssuesTableProps {
  issues: GitHubIssue[];
  owner: string;
  repo: string;
}

export function IssuesTable({ issues, owner, repo }: IssuesTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function toggleIssue(issue: GitHubIssue) {
    setLoadingId(issue.id);
    const newState = issue.state === "open" ? "closed" : "open";
    try {
      const res = await fetch(
        `/api/github/repos/${owner}/${repo}/issues/${issue.number}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: newState }),
        }
      );
      if (!res.ok) throw new Error("Failed to update issue");
      toast.success(
        `Issue #${issue.number} ${newState === "closed" ? "closed" : "reopened"}`
      );
      router.refresh();
    } catch {
      toast.error("Failed to update issue");
    } finally {
      setLoadingId(null);
    }
  }

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">No issues found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">Status</TableHead>
          <TableHead>Title</TableHead>
          <TableHead className="w-[100px]">Labels</TableHead>
          <TableHead className="w-[80px] text-center">Comments</TableHead>
          <TableHead className="w-[120px]">Updated</TableHead>
          <TableHead className="w-[80px]">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {issues.map((issue) => (
          <TableRow key={issue.id}>
            <TableCell>
              {issue.state === "open" ? (
                <IconCircleDot className="h-4 w-4 text-green-500" />
              ) : (
                <IconCircleCheck className="h-4 w-4 text-purple-500" />
              )}
            </TableCell>
            <TableCell>
              <a
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
              >
                {issue.title}
              </a>
              <p className="text-xs text-muted-foreground">
                #{issue.number} opened by {issue.user.login}
              </p>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {issue.labels.slice(0, 2).map((label) => (
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
                {issue.comments}
              </span>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {new Date(issue.updated_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                disabled={loadingId === issue.id}
                onClick={() => toggleIssue(issue)}
              >
                {issue.state === "open" ? "Close" : "Reopen"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
