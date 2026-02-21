"use client";

import { useState } from "react";
import { IconDownload, IconNotes } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function ExportPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function exportData(type: "repos" | "starred" | "gists") {
    setLoading(type);
    try {
      const endpoints: Record<string, string> = {
        repos: "/api/github/repos",
        starred: "/api/github/starred",
        gists: "/api/github/gists",
      };

      const res = await fetch(endpoints[type]);
      const data = await res.json();

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `github-${type}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${type} data successfully`);
    } catch {
      toast.error(`Failed to export ${type} data`);
    } finally {
      setLoading(null);
    }
  }

  async function exportCSV() {
    setLoading("csv");
    try {
      const res = await fetch("/api/github/repos");
      const repos = await res.json();

      const headers = ["name", "full_name", "description", "language", "stars", "forks", "open_issues", "visibility", "created_at", "updated_at", "html_url"];
      const rows = repos.map((r: Record<string, unknown>) => [
        r.name,
        r.full_name,
        `"${((r.description as string) || "").replace(/"/g, '""')}"`,
        r.language || "",
        r.stargazers_count,
        r.forks_count,
        r.open_issues_count,
        (r as Record<string, unknown>).private ? "private" : "public",
        r.created_at,
        r.updated_at,
        r.html_url,
      ]);

      const csv = [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `github-repos-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Exported CSV successfully");
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <IconNotes className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Export & Backup</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Repositories (JSON)</CardTitle>
            <CardDescription>Export all your repository metadata</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => exportData("repos")}
              disabled={loading === "repos"}
              className="w-full"
            >
              <IconDownload className="mr-2 h-4 w-4" />
              {loading === "repos" ? "Exporting..." : "Export Repos"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Repositories (CSV)</CardTitle>
            <CardDescription>Export repos as spreadsheet-friendly CSV</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={exportCSV}
              disabled={loading === "csv"}
              className="w-full"
            >
              <IconDownload className="mr-2 h-4 w-4" />
              {loading === "csv" ? "Exporting..." : "Export CSV"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Starred Repos (JSON)</CardTitle>
            <CardDescription>Export your starred repositories</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => exportData("starred")}
              disabled={loading === "starred"}
              className="w-full"
            >
              <IconDownload className="mr-2 h-4 w-4" />
              {loading === "starred" ? "Exporting..." : "Export Starred"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gists (JSON)</CardTitle>
            <CardDescription>Export all your gist metadata</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => exportData("gists")}
              disabled={loading === "gists"}
              className="w-full"
            >
              <IconDownload className="mr-2 h-4 w-4" />
              {loading === "gists" ? "Exporting..." : "Export Gists"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
