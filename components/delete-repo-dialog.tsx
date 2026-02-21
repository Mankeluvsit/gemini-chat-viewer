"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DeleteRepoDialogProps {
  owner: string;
  repo: string;
  children: React.ReactNode;
}

export function DeleteRepoDialog({
  owner,
  repo,
  children,
}: DeleteRepoDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fullName = `${owner}/${repo}`;

  async function handleDelete() {
    if (confirmation !== fullName) {
      toast.error("Please type the repository name to confirm");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/github/repos/${owner}/${repo}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to delete repository");
      }

      toast.success(`Repository "${fullName}" deleted`);
      setOpen(false);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete repository"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Repository</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the{" "}
            <strong>{fullName}</strong> repository, wiki, issues, comments,
            packages, secrets, workflow runs, and remove all collaborator
            associations.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2 py-4">
          <label className="text-sm font-medium">
            Please type <strong>{fullName}</strong> to confirm.
          </label>
          <Input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={fullName}
          />
        </div>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || confirmation !== fullName}
          >
            {loading ? "Deleting..." : "Delete this repository"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
