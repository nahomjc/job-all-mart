"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { banUserAction, unbanUserAction } from "@/server/actions/admin";

interface UserRowActionsProps {
  userId: string;
  status: string;
}

export function UserRowActions({ userId, status }: UserRowActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    startTransition(async () => {
      const r = await fn();
      if (r.ok) {
        toast.success("Done");
        router.refresh();
      } else {
        toast.error(r.error ?? "Failed");
      }
    });
  };

  return (
    <div className="flex gap-2">
      {status === "banned" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => run(() => unbanUserAction(userId))}
        >
          Unban
        </Button>
      ) : (
        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={() => {
            const reason = window.prompt("Reason?");
            if (!reason) return;
            run(() => banUserAction(userId, reason));
          }}
        >
          Ban
        </Button>
      )}
    </div>
  );
}
