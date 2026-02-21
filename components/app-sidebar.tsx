"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconSettings,
  IconBrandGithub,
  IconStar,
  IconBell,
  IconSearch,
  IconCode,
  IconTimeline,
  IconUser,
  IconNotes,
  IconSparkles,
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Repositories", url: "/dashboard", icon: IconDashboard },
  { title: "Discover", url: "/dashboard/discover", icon: IconSparkles },
  { title: "Starred", url: "/dashboard/starred", icon: IconStar },
  { title: "Notifications", url: "/dashboard/notifications", icon: IconBell },
  { title: "Activity", url: "/dashboard/activity", icon: IconTimeline },
];

const toolsNav = [
  { title: "Code Search", url: "/dashboard/search", icon: IconSearch },
  { title: "Gists", url: "/dashboard/gists", icon: IconCode },
  { title: "Profile", url: "/dashboard/profile", icon: IconUser },
  { title: "Export", url: "/dashboard/export", icon: IconNotes },
  { title: "Settings", url: "/dashboard/settings", icon: IconSettings },
];

export function AppSidebar() {
  const pathname = usePathname();

  function isActive(url: string) {
    if (url === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(url);
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <IconBrandGithub className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    GitHub Dashboard
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Repo Manager
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandGithub className="size-4" />
                <span>Open GitHub</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
