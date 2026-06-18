import { Card, CardContent } from "@/components/ui/card";
import { JobForm } from "@/components/jobs/job-form";
import { requireUser } from "@/lib/auth";
import { categoryRepo } from "@/server/repositories/category";

export const metadata = { title: "Post a job" };

export default async function NewJobPage() {
  await requireUser();
  const categories = await categoryRepo.list();
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Post a job</h1>
        <p className="text-sm text-muted-foreground">
          Work through each step — job details first, then payment proof. An admin
          will review your post before it goes live.
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <JobForm
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
