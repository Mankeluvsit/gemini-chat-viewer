"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface RepoTabsProps {
  owner: string;
  repo: string;
}

const tabs = [
  { label: "Overview", path: "" },
  { label: "Files", path: "/files" },
  { label: "Issues", path: "/issues" },
  { label: "Pull Requests", path: "/pulls" },
  { label: "Branches", path: "/branches" },
  { label: "Releases", path: "/releases" },
  { label: "Activity", path: "/activity" },
  { label: "Collaborators", path: "/collaborators" },
  { label: "Settings", path: "/settings" },
];

export function RepoTabs({ owner, repo }: RepoTabsProps) {
  const pathname = usePathname();
  const basePath = `/dashboard/repos/${owner}/${repo}`;

  return (
    <div className="border-b">
      <nav className="-mb-px flex gap-4 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const href = `${basePath}${tab.path}`;
          const isActive =
            tab.path === ""
              ? pathname === basePath
              : pathname.startsWith(href);

          return (
            <Link
              key={tab.label}
              href={href}
              className={cn(
                "whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
