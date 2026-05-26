"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCategoryAction,
  type AdminActionState,
} from "@/server/actions/admin";

const initial: AdminActionState = { ok: false };

export function CategoryForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    createCategoryAction,
    initial,
  );
  if (state.ok) {
    toast.success("Category created");
    router.refresh();
  } else if (state.error) {
    toast.error(state.error);
  }
  return (
    <form action={action} className="grid gap-3 md:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="IT Jobs" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" placeholder="it-jobs" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="telegramTopicId">Telegram topic ID</Label>
        <Input
          id="telegramTopicId"
          name="telegramTopicId"
          type="number"
          placeholder="1002"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sortOrder">Sort order</Label>
        <Input id="sortOrder" name="sortOrder" type="number" defaultValue={0} />
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create category"}
        </Button>
      </div>
    </form>
  );
}
