"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CategoryFields } from "@/components/admin/category-fields";
import { createCategoryAction } from "@/server/actions/admin";

export function CategoryForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await createCategoryAction({ ok: false }, formData);
      if (result.ok) {
        toast.success("Category created");
        form.reset();
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to create category");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <CategoryFields idPrefix="create" />
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create category"}
        </Button>
      </div>
    </form>
  );
}
