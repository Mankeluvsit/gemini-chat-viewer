import { Suspense } from "react";
import { getGists } from "@/lib/github";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IconCode, IconFile } from "@tabler/icons-react";

async function GistsContent() {
  const gists = await getGists(1, 50);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <IconCode className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Gists</h1>
        <span className="text-sm text-muted-foreground">({gists.length})</span>
      </div>

      {gists.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No gists found</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {gists.map((gist) => {
            const files = Object.values(gist.files);
            return (
              <a
                key={gist.id}
                href={gist.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Card className="h-full hover:border-primary/50 hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm line-clamp-1">
                        {gist.description || files[0]?.filename || "Untitled gist"}
                      </CardTitle>
                      <Badge variant={gist.public ? "outline" : "secondary"} className="text-[10px] shrink-0">
                        {gist.public ? "Public" : "Secret"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1">
                        {files.slice(0, 3).map((f) => (
                          <span key={f.filename} className="flex items-center gap-1 text-xs text-muted-foreground">
                            <IconFile className="h-3 w-3" />
                            {f.filename}
                          </span>
                        ))}
                        {files.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{files.length - 3} more</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Updated {new Date(gist.updated_at).toLocaleDateString()}
                        {gist.comments > 0 && ` - ${gist.comments} comments`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function GistsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <GistsContent />
    </Suspense>
  );
}
