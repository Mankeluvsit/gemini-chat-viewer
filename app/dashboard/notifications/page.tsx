import { Suspense } from "react";
import { getNotifications } from "@/lib/github";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconBell,
  IconGitPullRequest,
  IconAlertCircle,
  IconMessage,
} from "@tabler/icons-react";

function getTypeIcon(type: string) {
  switch (type) {
    case "PullRequest":
      return <IconGitPullRequest className="h-4 w-4 text-primary" />;
    case "Issue":
      return <IconAlertCircle className="h-4 w-4 text-yellow-400" />;
    default:
      return <IconMessage className="h-4 w-4 text-muted-foreground" />;
  }
}

async function NotificationsContent() {
  let notifications: Awaited<ReturnType<typeof getNotifications>> = [];
  try {
    notifications = await getNotifications(true);
  } catch {
    notifications = [];
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <IconBell className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Notifications</h1>
        <Badge variant="secondary">{notifications.filter((n: { unread: boolean }) => n.unread).length} unread</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications</p>
          ) : (
            <div className="flex flex-col gap-2">
              {notifications.map((notif: { id: string; unread: boolean; subject: { type: string; title: string }; repository: { full_name: string }; reason: string; updated_at: string }) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 rounded-md p-3 ${
                    notif.unread ? "bg-primary/5 border border-primary/20" : "border"
                  }`}
                >
                  {getTypeIcon(notif.subject.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">
                      {notif.subject.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notif.repository.full_name} &middot; {notif.reason}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(notif.updated_at).toLocaleDateString()}
                  </span>
                  {notif.unread && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      }
    >
      <NotificationsContent />
    </Suspense>
  );
}
