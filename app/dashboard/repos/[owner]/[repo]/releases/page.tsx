import { Suspense } from "react";
import { getReleases } from "@/lib/github";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IconTag, IconDownload } from "@tabler/icons-react";

interface ReleasesPageProps {
  params: Promise<{ owner: string; repo: string }>;
}

async function ReleasesContent({ owner, repo }: { owner: string; repo: string }) {
  const releases = await getReleases(owner, repo);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Releases ({releases.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {releases.length === 0 ? (
          <p className="text-sm text-muted-foreground">No releases yet</p>
        ) : (
          <div className="flex flex-col gap-4">
            {releases.map((release) => (
              <a
                key={release.id}
                href={release.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-2 rounded-md border p-4 hover:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <IconTag className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {release.name || release.tag_name}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {release.tag_name}
                  </Badge>
                  {release.prerelease && (
                    <Badge variant="secondary" className="text-[10px]">
                      Pre-release
                    </Badge>
                  )}
                  {release.draft && (
                    <Badge variant="secondary" className="text-[10px]">
                      Draft
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Published {new Date(release.published_at).toLocaleDateString()}{" "}
                  by {release.author.login}
                </p>
                {release.assets.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {release.assets.map((asset) => (
                      <span
                        key={asset.name}
                        className="flex items-center gap-1 text-xs text-muted-foreground"
                      >
                        <IconDownload className="h-3 w-3" />
                        {asset.name} ({asset.download_count})
                      </span>
                    ))}
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function ReleasesPage({ params }: ReleasesPageProps) {
  const { owner, repo } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
      <ReleasesContent owner={owner} repo={repo} />
    </Suspense>
  );
}
