import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function fetchRateLimit() {
  try {
    const token = process.env.GITHUB_PAT;
    if (!token) return null;

    const res = await fetch("https://api.github.com/rate_limit", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function SettingsPage() {
  const hasToken = !!process.env.GITHUB_PAT;
  const rateLimit = await fetchRateLimit();

  const core = rateLimit?.resources?.core;
  const resetDate = core
    ? new Date(core.reset * 1000).toLocaleTimeString()
    : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">GitHub Personal Access Token</CardTitle>
          <CardDescription>
            Configured via the GITHUB_PAT environment variable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-sm">Status:</span>
            {hasToken ? (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                Connected
              </Badge>
            ) : (
              <Badge variant="destructive">Not configured</Badge>
            )}
          </div>
          {!hasToken && (
            <p className="mt-2 text-sm text-muted-foreground">
              Set the GITHUB_PAT environment variable with a GitHub personal
              access token that has the &quot;repo&quot; and &quot;delete_repo&quot; scopes.
            </p>
          )}
        </CardContent>
      </Card>

      {core && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">API Rate Limit</CardTitle>
            <CardDescription>
              GitHub API usage for the current hour.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Used</p>
                <p className="text-2xl font-bold">{core.used}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold">{core.remaining}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Limit</p>
                <p className="text-2xl font-bold">{core.limit}</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${((core.limit - core.remaining) / core.limit) * 100}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Resets at {resetDate}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            GitHub Repos Dashboard - A personal dashboard to view and manage your GitHub repositories.
            Built with Next.js, shadcn/ui, and the GitHub REST API.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
