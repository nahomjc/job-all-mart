import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { jobRepo } from "@/server/repositories/job";
import { PaymentForm } from "@/components/jobs/payment-form";

export const metadata = { title: "Upload payment" };

export default async function PaymentPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const user = await requireUser();
  const job = await jobRepo.byId(id);
  if (!job) notFound();
  if (job.userId !== user.id) redirect("/dashboard/jobs");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Upload payment proof</h1>
        <p className="text-sm text-muted-foreground">
          For: <span className="font-medium">{job.title}</span>
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Payment details</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentForm jobId={job.id} />
        </CardContent>
      </Card>
    </div>
  );
}
