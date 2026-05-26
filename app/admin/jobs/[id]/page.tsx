import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  AtSign,
  Briefcase,
  Building2,
  ExternalLink,
  Mail,
  MapPin,
  Send,
} from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Moderation
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
            {job.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="size-3.5" />
              {job.company}
            </span>
            <span aria-hidden="true">·</span>
            <span>{category?.name ?? "Uncategorized"}</span>
            <Badge variant={jobBadgeVariant(job.status)}>
              {statusLabel(job.status)}
            </Badge>
            <Badge
              variant={
                job.spamScore >= 50
                  ? "destructive"
                  : job.spamScore >= 20
                    ? "warning"
                    : "secondary"
              }
            >
              Spam {job.spamScore}
            </Badge>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/jobs">
            <ArrowLeft className="size-3.5" /> Back to queue
          </Link>
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
              <Info
                icon={Briefcase}
                label="Type"
                value={statusLabel(job.employmentType)}
              />
              <Info icon={MapPin} label="Location" value={job.location} />
              <Info
                label="Salary"
                value={formatSalary(
                  job.salaryMin,
                  job.salaryMax,
                  job.salaryCurrency,
                )}
              />
              <Info label="Source" value={job.source} />
              <Info
                label="Created"
                value={formatRelativeTime(job.createdAt)}
              />
              {job.applyUrl && (
                <Info
                  label="Apply URL"
                  value={
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-1 truncate text-primary hover:underline"
                    >
                      <span className="truncate">{job.applyUrl}</span>
                      <ExternalLink className="size-3 shrink-0" />
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
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{employer?.displayName ?? "—"}</p>
              {employer?.email && (
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="size-3.5" />
                  {employer.email}
                </p>
              )}
              {employer?.telegramUsername && (
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <AtSign className="size-3.5" />
                  {employer.telegramUsername}
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
            <CardContent className="space-y-3 text-sm">
              {payment ? (
                <>
                  <Row label="Amount">
                    <span className="font-medium">
                      {payment.amount} {payment.currency}
                    </span>
                  </Row>
                  <Row label="Method">{statusLabel(payment.method)}</Row>
                  <Row label="Status">
                    <Badge variant={paymentBadgeVariant(payment.status)}>
                      {statusLabel(payment.status)}
                    </Badge>
                  </Row>
                  {payment.referenceCode && (
                    <Row label="Ref">
                      <span className="font-mono text-xs">
                        {payment.referenceCode}
                      </span>
                    </Row>
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
                <CardTitle className="flex items-center gap-2">
                  <Send className="size-4" /> Telegram posts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {tgPosts.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border bg-muted/30 p-3"
                  >
                    <a
                      href={p.messageUrl ?? "#"}
                      className="font-medium text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Message #{p.messageId}
                    </a>
                    <p className="mt-0.5 text-xs text-muted-foreground">
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

function Info({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </p>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-right">{children}</span>
    </div>
  );
}

function jobBadgeVariant(
  status: string,
): "default" | "secondary" | "success" | "warning" | "destructive" | "outline" {
  switch (status) {
    case "posted":
      return "success";
    case "approved":
    case "scheduled":
      return "secondary";
    case "pending_payment":
    case "pending_review":
      return "warning";
    case "rejected":
    case "expired":
      return "destructive";
    default:
      return "outline";
  }
}

function paymentBadgeVariant(
  status: string,
): "default" | "secondary" | "success" | "warning" | "destructive" | "outline" {
  switch (status) {
    case "verified":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
    case "refunded":
      return "destructive";
    default:
      return "secondary";
  }
}
