"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const shortcuts = [
  { key: "/", description: "Focus search" },
  { key: "g h", description: "Go to dashboard home" },
  { key: "g s", description: "Go to starred repos" },
  { key: "g n", description: "Go to notifications" },
  { key: "g a", description: "Go to activity" },
  { key: "g p", description: "Go to profile" },
  { key: "g e", description: "Go to export" },
  { key: "?", description: "Show keyboard shortcuts" },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip if in input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "?") {
        e.preventDefault();
        setOpen(true);
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder*="Search"]'
        );
        searchInput?.focus();
        return;
      }

      if (e.key === "g") {
        setPendingKey("g");
        setTimeout(() => setPendingKey(null), 1000);
        return;
      }

      if (pendingKey === "g") {
        setPendingKey(null);
        switch (e.key) {
          case "h": router.push("/dashboard"); break;
          case "s": router.push("/dashboard/starred"); break;
          case "n": router.push("/dashboard/notifications"); break;
          case "a": router.push("/dashboard/activity"); break;
          case "p": router.push("/dashboard/profile"); break;
          case "e": router.push("/dashboard/export"); break;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pendingKey, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-1">
              <span className="text-sm text-muted-foreground">{s.description}</span>
              <kbd className="rounded border bg-muted px-2 py-0.5 text-xs font-mono">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
