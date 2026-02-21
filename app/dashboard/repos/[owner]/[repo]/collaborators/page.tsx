import { Suspense } from "react";
import { getCollaborators } from "@/lib/github";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface CollaboratorsPageProps {
  params: Promise<{ owner: string; repo: string }>;
}

async function CollaboratorsContent({ owner, repo }: { owner: string; repo: string }) {
  let collaborators: Awaited<ReturnType<typeof getCollaborators>> = [];
  try {
    collaborators = await getCollaborators(owner, repo);
  } catch {
    collaborators = [];
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Collaborators ({collaborators.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {collaborators.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No collaborators found or insufficient permissions to view
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {collaborators.map((collab) => (
              <a
                key={collab.login}
                href={collab.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={collab.avatar_url} alt={collab.login} />
                  <AvatarFallback>{collab.login[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm font-medium">{collab.login}</span>
                <Badge variant="outline" className="text-[10px]">
                  {collab.role_name}
                </Badge>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function CollaboratorsPage({ params }: CollaboratorsPageProps) {
  const { owner, repo } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
      <CollaboratorsContent owner={owner} repo={repo} />
    </Suspense>
  );
}
