import { Suspense } from "react";
import { getUser, getRepos } from "@/lib/github";
import { RepoHeatmap } from "@/components/repo-heatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { LanguageChart } from "@/components/language-chart";
import {
  IconUser,
  IconMapPin,
  IconLink,
  IconBuilding,
  IconCalendar,
  IconUsers,
  IconGitBranch,
} from "@tabler/icons-react";

async function ProfileContent() {
  const [user, repos] = await Promise.all([getUser(), getRepos()]);

  // Aggregate languages across all repos
  const allLanguages: Record<string, number> = {};
  repos.forEach((repo) => {
    if (repo.language) {
      allLanguages[repo.language] = (allLanguages[repo.language] || 0) + 1;
    }
  });

  // Contribution heatmap data - simplified using repo push dates
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <IconUser className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Profile</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar_url} alt={user.login} />
                <AvatarFallback>{user.login[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-bold">{user.name || user.login}</h2>
                <p className="text-sm text-muted-foreground">@{user.login}</p>
              </div>
              {user.bio && <p className="text-sm">{user.bio}</p>}
              <div className="flex flex-col gap-2 w-full text-left">
                {user.company && (
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconBuilding className="h-4 w-4" /> {user.company}
                  </span>
                )}
                {user.location && (
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconMapPin className="h-4 w-4" /> {user.location}
                  </span>
                )}
                {user.blog && (
                  <a
                    href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <IconLink className="h-4 w-4" /> {user.blog}
                  </a>
                )}
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconCalendar className="h-4 w-4" /> Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <IconUsers className="h-4 w-4" />
                  <strong>{user.followers}</strong> followers
                </span>
                <span>
                  <strong>{user.following}</strong> following
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats and Charts */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">Repos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{user.public_repos}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">Stars</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalStars}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">Forks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalForks}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">Gists</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{user.public_gists}</p>
              </CardContent>
            </Card>
          </div>

          {/* Cross-repo language breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <IconGitBranch className="h-4 w-4" />
                Language Distribution (across all repos)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LanguageChart languages={allLanguages} />
            </CardContent>
          </Card>

          {/* Contribution heatmap placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Repo Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <RepoHeatmap repos={repos} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-[400px] rounded-xl" />
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="grid gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[80px] rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-[200px] rounded-xl" />
            </div>
          </div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
