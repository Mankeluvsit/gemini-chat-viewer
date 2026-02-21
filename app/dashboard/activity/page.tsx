import { Suspense } from "react";
import { getUserEvents, getUser } from "@/lib/github";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { IconTimeline } from "@tabler/icons-react";

function getEventDescription(event: { type: string; payload: Record<string, unknown>; repo: { name: string } }): string {
  switch (event.type) {
    case "PushEvent":
      return `Pushed to ${event.repo.name}`;
    case "CreateEvent":
      return `Created ${(event.payload.ref_type as string) || "repository"} in ${event.repo.name}`;
    case "DeleteEvent":
      return `Deleted ${(event.payload.ref_type as string) || "branch"} in ${event.repo.name}`;
    case "IssuesEvent":
      return `${(event.payload.action as string) || "updated"} issue in ${event.repo.name}`;
    case "PullRequestEvent":
      return `${(event.payload.action as string) || "updated"} PR in ${event.repo.name}`;
    case "WatchEvent":
      return `Starred ${event.repo.name}`;
    case "ForkEvent":
      return `Forked ${event.repo.name}`;
    case "IssueCommentEvent":
      return `Commented on issue in ${event.repo.name}`;
    case "PullRequestReviewEvent":
      return `Reviewed PR in ${event.repo.name}`;
    case "ReleaseEvent":
      return `${(event.payload.action as string) || "published"} release in ${event.repo.name}`;
    default:
      return `${event.type.replace("Event", "")} in ${event.repo.name}`;
  }
}

function getEventColor(type: string): string {
  switch (type) {
    case "PushEvent": return "bg-green-400";
    case "PullRequestEvent": return "bg-purple-400";
    case "IssuesEvent": return "bg-yellow-400";
    case "CreateEvent": return "bg-cyan-400";
    case "DeleteEvent": return "bg-red-400";
    case "WatchEvent": return "bg-yellow-300";
    case "ForkEvent": return "bg-blue-400";
    default: return "bg-muted-foreground";
  }
}

async function ActivityContent() {
  const user = await getUser();
  const events = await getUserEvents(user.login, 1, 50);

  // Group by date
  const grouped: Record<string, typeof events> = {};
  events.forEach((event) => {
    const date = new Date(event.created_at).toLocaleDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(event);
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <IconTimeline className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Activity Timeline</h1>
      </div>

      {Object.entries(grouped).map(([date, dayEvents]) => (
        <Card key={date}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">{date}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative flex flex-col gap-3 pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
              {dayEvents.map((event) => (
                <div key={event.id} className="relative flex items-start gap-3">
                  <div className={`absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full ${getEventColor(event.type)}`} />
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={event.actor.avatar_url} />
                    <AvatarFallback className="text-[10px]">
                      {event.actor.login[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{getEventDescription(event)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {events.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
      )}
    </div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6">
          <Skeleton className="h-8 w-64" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-xl" />
          ))}
        </div>
      }
    >
      <ActivityContent />
    </Suspense>
  );
}
