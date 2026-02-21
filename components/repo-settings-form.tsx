"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DeleteRepoDialog } from "@/components/delete-repo-dialog";
import type { GitHubRepo } from "@/lib/github";

interface RepoSettingsFormProps {
  repo: GitHubRepo;
}

export function RepoSettingsForm({ repo }: RepoSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(repo.description || "");
  const [homepage, setHomepage] = useState(repo.homepage || "");
  const [topics, setTopics] = useState(repo.topics?.join(", ") || "");
  const [isPrivate, setIsPrivate] = useState(repo.private);
  const [hasIssues, setHasIssues] = useState(repo.has_issues);
  const [hasWiki, setHasWiki] = useState(repo.has_wiki);
  const [archived, setArchived] = useState(repo.archived);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/github/repos/${repo.owner.login}/${repo.name}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: description.trim(),
            homepage: homepage.trim(),
            private: isPrivate,
            has_issues: hasIssues,
            has_wiki: hasWiki,
            archived,
            topics: topics
              .split(",")
              .map((t) => t.trim().toLowerCase())
              .filter(Boolean),
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update repository");
      }

      toast.success("Repository settings updated");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update settings"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>
            Update your repository settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Repository description"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="homepage" className="text-sm font-medium">
              Homepage URL
            </label>
            <Input
              id="homepage"
              value={homepage}
              onChange={(e) => setHomepage(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="topics" className="text-sm font-medium">
              Topics (comma-separated)
            </label>
            <Input
              id="topics"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="react, nextjs, dashboard"
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="private"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-input"
              />
              <label htmlFor="private" className="text-sm font-medium">
                Private repository
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="issues"
                checked={hasIssues}
                onChange={(e) => setHasIssues(e.target.checked)}
                className="rounded border-input"
              />
              <label htmlFor="issues" className="text-sm font-medium">
                Enable issues
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="wiki"
                checked={hasWiki}
                onChange={(e) => setHasWiki(e.target.checked)}
                className="rounded border-input"
              />
              <label htmlFor="wiki" className="text-sm font-medium">
                Enable wiki
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="archived"
                checked={archived}
                onChange={(e) => setArchived(e.target.checked)}
                className="rounded border-input"
              />
              <label htmlFor="archived" className="text-sm font-medium">
                Archive this repository
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteRepoDialog owner={repo.owner.login} repo={repo.name}>
            <Button variant="destructive">Delete this repository</Button>
          </DeleteRepoDialog>
        </CardContent>
      </Card>
    </div>
  );
}
