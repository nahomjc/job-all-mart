import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Receipt } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
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
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Payment"
        title="Upload payment proof"
        description={
          <>
            For <span className="font-medium text-foreground">{job.title}</span>{" "}
            at {job.company}
          </>
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/jobs/${job.id}`}>
              <ArrowLeft className="size-3.5" />
              Back to job
            </Link>
          </Button>
        }
      />

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Receipt className="size-4" />
            </span>
            Payment details
          </CardTitle>
          <CardDescription>
            Upload a clear screenshot of your transfer (CBE, Telebirr, Dashen,
            etc.). Reference and suffix/phone are optional while testing — our
            team will verify before your job goes live.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <PaymentForm jobId={job.id} />
        </CardContent>
      </Card>
    </div>
  );
}
