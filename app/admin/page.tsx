import Link from "next/link";
import {
  ArrowRight,
  Ban,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  MousePointerClick,
  Receipt,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/server/db/client";
import { jobs, payments, users, telegramPosts } from "@/server/db/schema";
import { count, desc, eq, sql } from "drizzle-orm";
import { formatRelativeTime, statusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Admin overview" };

export default async function AdminOverviewPage() {
  const [
    [jobTotals],
    [paymentTotals],
    [userTotals],
    [tgTotals],
    queueJobs,
  ] = await Promise.all([
    db
      .select({
        total: count(),
        pending: sql<number>`count(*) filter (where ${jobs.status} in ('pending_review','pending_payment'))`,
        review: sql<number>`count(*) filter (where ${jobs.status} = 'pending_review')`,
        posted: sql<number>`count(*) filter (where ${jobs.status} = 'posted')`,
      })
      .from(jobs),
    db
      .select({
        revenueMinor: sql<number>`coalesce(sum(${payments.amount}) filter (where ${payments.status} = 'verified'), 0)`,
        pending: sql<number>`count(*) filter (where ${payments.status} = 'pending')`,
      })
      .from(payments),
    db
      .select({
        total: count(),
        active: sql<number>`count(*) filter (where ${users.status} = 'active')`,
        banned: sql<number>`count(*) filter (where ${users.status} = 'banned')`,
      })
      .from(users),
    db
      .select({
        clicks: sql<number>`coalesce(sum(${telegramPosts.clickCount}), 0)`,
        posts: count(),
      })
      .from(telegramPosts),
    db
      .select({
        id: jobs.id,
        title: jobs.title,
        company: jobs.company,
        status: jobs.status,
        createdAt: jobs.createdAt,
      })
      .from(jobs)
      .where(eq(jobs.status, "pending_review"))
      .orderBy(desc(jobs.createdAt))
      .limit(6),
  ]);

  const pendingReview = Number(jobTotals?.review ?? 0);
  const pendingPipeline = Number(jobTotals?.pending ?? 0);
  const pendingPayments = Number(paymentTotals?.pending ?? 0);
  const totalJobs = Number(jobTotals?.total ?? 0);
  const postedJobs = Number(jobTotals?.posted ?? 0);
  const postedPct =
    totalJobs > 0 ? Math.round((postedJobs / totalJobs) * 100) : 0;
  const attentionCount = pendingReview + pendingPayments;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Dashboard"
        description="Monitor submissions, payments, and publishing health."
        actions={
          <>
            <Button asChild variant="outline" className="h-10 rounded-xl">
              <Link href="/admin/audit">Audit logs</Link>
            </Button>
            <Button asChild className="h-10 rounded-xl">
              <Link href="/admin/jobs?status=pending_review">
                Review queue
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        }
      />

      {attentionCount > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/20 dark:bg-amber-500/[0.07]">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
              <Clock className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {attentionCount} item{attentionCount === 1 ? "" : "s"} need attention
              </p>
              <p className="text-xs text-muted-foreground">
                {pendingReview} awaiting review · {pendingPayments} payment
                {pendingPayments === 1 ? "" : "s"} to verify
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {pendingReview > 0 && (
              <Button asChild size="sm" className="h-9 rounded-lg">
                <Link href="/admin/jobs?status=pending_review">Open queue</Link>
              </Button>
            )}
            {pendingPayments > 0 && (
              <Button asChild size="sm" variant="outline" className="h-9 rounded-lg bg-background/70">
                <Link href="/admin/payments">Verify payments</Link>
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Total jobs"
          value={totalJobs}
          hint="All platform submissions"
          icon={Briefcase}
        />
        <MetricTile
          label="Live posts"
          value={postedJobs}
          hint={`${postedPct}% of all jobs`}
          icon={CheckCircle2}
          tone="success"
        />
        <MetricTile
          label="Awaiting review"
          value={pendingReview}
          hint="In approval queue"
          icon={Clock}
          tone="warning"
        />
        <MetricTile
          label="Pending payments"
          value={pendingPayments}
          hint="Screenshots to verify"
          icon={Receipt}
          tone="info"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="border-border/70 shadow-none lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/60 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">Approval queue</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Newest jobs waiting for review
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-lg">
              <Link href="/admin/jobs?status=pending_review">
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {queueJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <CheckCircle2 className="size-5" />
                </span>
                <p className="text-sm font-medium">Queue is clear</p>
                <p className="text-xs text-muted-foreground">
                  No jobs are waiting for approval right now.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {queueJobs.map((job) => (
                  <li key={job.id}>
                    <Link
                      href={`/admin/jobs/${job.id}`}
                      className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground">
                        <Briefcase className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{job.title}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {job.company || "Unknown company"} ·{" "}
                          {formatRelativeTime(job.createdAt)}
                        </p>
                      </div>
                      <Badge variant="warning" className="shrink-0 rounded-md">
                        {statusLabel(job.status)}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="border-border/70 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Publishing rate</CardTitle>
              <p className="text-xs text-muted-foreground">
                Share of jobs that reached posted status
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <p className="text-3xl font-semibold tabular-nums tracking-tight">
                  {postedPct}%
                </p>
                <p className="pb-1 text-xs text-muted-foreground">
                  {postedJobs} / {totalJobs} jobs
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${postedPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {pendingPipeline} still in payment or review pipeline
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick links</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <QuickLink href="/admin/payments" label="Verify payments" count={pendingPayments} />
              <QuickLink href="/admin/users" label="Manage users" count={Number(userTotals?.total ?? 0)} />
              <QuickLink href="/admin/categories" label="Categories" />
              <QuickLink href="/admin/settings" label="Platform settings" />
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Platform metrics</h2>
            <p className="text-xs text-muted-foreground">
              Revenue, reach, and account health
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MetricTile
            label="Verified revenue"
            value={`$${Number(paymentTotals?.revenueMinor ?? 0).toLocaleString()}`}
            icon={DollarSign}
            tone="success"
          />
          <MetricTile
            label="Telegram clicks"
            value={Number(tgTotals?.clicks ?? 0).toLocaleString()}
            icon={MousePointerClick}
            tone="info"
          />
          <MetricTile
            label="Telegram posts"
            value={Number(tgTotals?.posts ?? 0).toLocaleString()}
            icon={Briefcase}
            tone="info"
          />
          <MetricTile
            label="Active users"
            value={Number(userTotals?.active ?? 0).toLocaleString()}
            icon={Users}
            tone="primary"
          />
          <MetricTile
            label="Total users"
            value={Number(userTotals?.total ?? 0).toLocaleString()}
            icon={Users}
          />
          <MetricTile
            label="Banned users"
            value={Number(userTotals?.banned ?? 0).toLocaleString()}
            icon={Ban}
            tone="destructive"
          />
        </div>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "primary" | "success" | "warning" | "info" | "destructive";
}) {
  const tones = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    success:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    warning:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    info: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
    destructive:
      "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  } as const;

  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-xl",
              tones[tone],
            )}
          >
            <Icon className="size-4" />
          </span>
        </div>
        <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function QuickLink({
  href,
  label,
  count,
}: {
  href: string;
  label: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5 text-sm transition-colors hover:bg-muted/50"
    >
      <span className="font-medium">{label}</span>
      <span className="flex items-center gap-2 text-muted-foreground">
        {typeof count === "number" && (
          <span className="tabular-nums text-xs">{count}</span>
        )}
        <ArrowRight className="size-3.5" />
      </span>
    </Link>
  );
}
