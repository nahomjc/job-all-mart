import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { jobRepo } from "@/server/repositories/job";
import { paymentRepo } from "@/server/repositories/payment";
import {
  formatRelativeTime,
  formatSalary,
  statusLabel,
} from "@/lib/format";

export default async function MyJobDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const user = await requireUser();
  const data = await jobRepo.byIdWithRelations(id);
  if (!data?.job) notFound();
  if (data.job.userId !== user.id) redirect("/dashboard/jobs");
  const payment = await paymentRepo.byJobId(id);

  const { job, category } = data;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <p className="text-sm text-muted-foreground">
            {job.company} · {category?.name ?? "Uncategorized"}
          </p>
        </div>
        <Badge>{statusLabel(job.status)}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <Detail label="Location" value={job.location} />
          <Detail label="Type" value={statusLabel(job.employmentType)} />
          <Detail
            label="Salary"
            value={formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
          />
          <Detail label="Source" value={job.source} />
          <Detail
            label="Submitted"
            value={formatRelativeTime(job.createdAt)}
          />
          {job.postedAt && (
            <Detail label="Posted" value={formatRelativeTime(job.postedAt)} />
          )}
          {job.rejectionReason && (
            <Detail
              label="Rejection reason"
              value={job.rejectionReason}
              className="md:col-span-2 text-destructive"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {payment ? (
            <>
              <Detail label="Amount" value={`${payment.amount} ${payment.currency}`} />
              <Detail label="Status" value={statusLabel(payment.status)} />
              {payment.screenshotUrl && (
                <a
                  href={payment.screenshotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  View screenshot <ExternalLink className="size-3" />
                </a>
              )}
              {(payment.status === "rejected" || job.status === "pending_payment") && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/jobs/${job.id}/payment`}>
                    Re-upload payment
                  </Link>
                </Button>
              )}
            </>
          ) : (
            <Button asChild>
              <Link href={`/dashboard/jobs/${job.id}/payment`}>
                Upload payment proof
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line text-sm">{job.description}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1">{value}</p>
    </div>
  );
}
