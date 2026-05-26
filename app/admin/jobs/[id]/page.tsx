import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminJobActions } from "@/components/admin/admin-job-actions";
import { jobRepo } from "@/server/repositories/job";
import { paymentRepo } from "@/server/repositories/payment";
import { telegramPostRepo } from "@/server/repositories/telegramPost";
import {
  formatRelativeTime,
  formatSalary,
  statusLabel,
} from "@/lib/format";

export default async function AdminJobReviewPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const data = await jobRepo.byIdWithRelations(id);
  if (!data?.job) notFound();
  const { job, category, employer } = data;
  const payment = await paymentRepo.byJobId(id);
  const tgPosts = await telegramPostRepo.byJobId(id);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <p className="text-sm text-muted-foreground">
            {job.company} · {category?.name ?? "Uncategorized"} ·{" "}
            <Badge>{statusLabel(job.status)}</Badge>{" "}
            <span className="text-xs">spam:{job.spamScore}</span>
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/jobs">← Back to queue</Link>
        </Button>
      </div>

      <AdminJobActions
        jobId={job.id}
        paymentId={payment?.id}
        paymentStatus={payment?.status}
        jobStatus={job.status}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Job description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Type" value={statusLabel(job.employmentType)} />
              <Info label="Location" value={job.location} />
              <Info
                label="Salary"
                value={formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
              />
              <Info label="Source" value={job.source} />
              <Info label="Created" value={formatRelativeTime(job.createdAt)} />
              {job.applyUrl && (
                <Info
                  label="Apply URL"
                  value={
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {job.applyUrl} <ExternalLink className="size-3" />
                    </a>
                  }
                />
              )}
            </div>
            <div className="whitespace-pre-line border-t pt-4 text-sm">
              {job.description}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{employer?.displayName ?? "—"}</p>
              {employer?.email && (
                <p className="text-muted-foreground">{employer.email}</p>
              )}
              {employer?.telegramUsername && (
                <p className="text-muted-foreground">
                  @{employer.telegramUsername}
                </p>
              )}
              {employer && (
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link href={`/admin/users/${employer.id}`}>View user</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {payment ? (
                <>
                  <p>
                    <span className="text-muted-foreground">Amount: </span>
                    {payment.amount} {payment.currency}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Method: </span>
                    {statusLabel(payment.method)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Status: </span>
                    <Badge>{statusLabel(payment.status)}</Badge>
                  </p>
                  {payment.referenceCode && (
                    <p>
                      <span className="text-muted-foreground">Ref: </span>
                      {payment.referenceCode}
                    </p>
                  )}
                  {payment.screenshotUrl && (
                    <a
                      href={payment.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Image
                        src={payment.screenshotUrl}
                        alt="Payment screenshot"
                        width={400}
                        height={300}
                        className="mt-2 rounded-md border"
                        unoptimized
                      />
                    </a>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">No payment uploaded.</p>
              )}
            </CardContent>
          </Card>

          {tgPosts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Telegram posts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {tgPosts.map((p) => (
                  <div key={p.id}>
                    <a
                      href={p.messageUrl ?? "#"}
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Message #{p.messageId}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      Topic {p.topicId ?? "—"} · {p.clickCount} clicks ·{" "}
                      {formatRelativeTime(p.createdAt)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-0.5">{value}</p>
    </div>
  );
}
