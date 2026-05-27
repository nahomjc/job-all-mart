"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryFields } from "@/components/admin/category-fields";
import { updateCategoryFormAction } from "@/server/actions/admin";
import type { Category } from "@/server/db/schema";

interface CategoryEditDialogProps {
  category: Category;
}

export function CategoryEditDialog({ category }: CategoryEditDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateCategoryFormAction(
        { ok: false },
        formData,
      );
      if (result.ok) {
        toast.success("Category updated");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to update category");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Pencil className="size-3.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit category</DialogTitle>
          <DialogDescription>
            Update how this category appears on the site and which Telegram forum
            topic receives approved jobs.
          </DialogDescription>
        </DialogHeader>
        <form
          key={category.updatedAt.toISOString()}
          onSubmit={onSubmit}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={category.id} />
          <CategoryFields
            idPrefix={`edit-${category.id}`}
            showStatus
            values={{
              name: category.name,
              slug: category.slug,
              description: category.description ?? "",
              telegramTopicId:
                category.telegramTopicId != null
                  ? String(category.telegramTopicId)
                  : "",
              sortOrder: category.sortOrder,
              active: category.active,
            }}
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
