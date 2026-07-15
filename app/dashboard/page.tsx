import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Plus,
  Wallet,
  XCircle,
} from "lucide-react";
import {
  DashPanel,
  GoalRow,
  KpiCard,
  OverviewBars,
  ProgressMeter,
  SegmentedBar,
} from "@/components/dashboard/dash-widgets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { jobRepo } from "@/server/repositories/job";
import { formatRelativeTime, statusLabel } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const rows = await jobRepo.listByUser(user.id);

  const stats = {
    total: rows.length,
    pending: rows.filter((r) =>
      ["pending_payment", "pending_review", "scheduled"].includes(r.job.status),
    ).length,
    posted: rows.filter((r) => r.job.status === "posted").length,
    rejected: rows.filter((r) => r.job.status === "rejected").length,
    pendingPay: rows.filter((r) => r.job.status === "pending_payment").length,
    inReview: rows.filter((r) => r.job.status === "pending_review").length,
  };

  const recent = rows.slice(0, 6);
  const nextPending = rows.find((r) =>
    ["pending_payment", "pending_review"].includes(r.job.status),
  );
  const postedPct =
    stats.total > 0 ? Math.round((stats.posted / stats.total) * 100) : 0;
  const firstName =
    (user.displayName ?? user.email ?? "there").split(/\s+/)[0] ?? "there";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back, {firstName}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Plan, prioritize, and track your job posts in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="h-10 rounded-full px-4">
            <Link href="/dashboard/jobs">View all jobs</Link>
          </Button>
          <Button asChild className="h-10 rounded-full px-4">
            <Link href="/dashboard/jobs/new">
              <Plus className="size-4" />
              New job post
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <DashPanel
          className="xl:col-span-7"
          title="Post analytics"
          description="Breakdown of your submissions by status"
          action={
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Your account
            </span>
          }
        >
          <OverviewBars
            items={[
              { label: "Posted", value: stats.posted, color: "bg-emerald-500/90" },
              { label: "Review", value: stats.inReview, color: "bg-amber-400" },
              { label: "Payment", value: stats.pendingPay, color: "bg-amber-400" },
              { label: "Rejected", value: stats.rejected, color: "bg-rose-400/90" },
            ]}
          />
        </DashPanel>

        <div className="grid gap-4 sm:grid-cols-3 xl:col-span-5 xl:grid-cols-1">
          <KpiCard
            label="Total posts"
            value={stats.total}
            hint="All submissions on your account"
            icon={Briefcase}
            tone="info"
          />
          <KpiCard
            label="In progress"
            value={stats.pending}
            delta={stats.pending > 0 ? "Needs follow-up" : "Nothing pending"}
            deltaTone={stats.pending > 0 ? "muted" : "success"}
            hint="payment, review, or scheduled"
            icon={Clock}
            tone="warning"
          />
          <KpiCard
            label="Live posts"
            value={stats.posted}
            delta={`+${postedPct}%`}
            hint="of your total posts"
            icon={CheckCircle2}
            tone="success"
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <DashPanel
          className="xl:col-span-5"
          title="Recent posts"
          description="Your latest submissions"
          contentClassName="p-0"
          action={
            rows.length > 0 ? (
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link href="/dashboard/jobs">
                  See all <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            ) : undefined
          }
        >
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Briefcase className="size-6" />
              </span>
              <p className="text-sm text-muted-foreground">
                You haven&apos;t submitted any jobs yet.
              </p>
              <Button asChild size="sm" className="rounded-full">
                <Link href="/dashboard/jobs/new">
                  <Plus className="size-4" /> Start your first post
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {recent.map(({ job, category }) => (
                <li key={job.id}>
                  <Link
                    href={`/dashboard/jobs/${job.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                      <Briefcase className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium">{job.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {category?.name ?? "Uncategorized"} ·{" "}
                        {formatRelativeTime(job.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={statusBadgeVariant(job.status)}
                      className="shrink-0 rounded-full"
                    >
                      {statusLabel(job.status)}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DashPanel>

        <DashPanel
          className="xl:col-span-4"
          title="Status mix"
          description="Share of your pipeline"
        >
          <SegmentedBar
            segments={[
              {
                label: "Posted",
                value: stats.posted,
                className: "bg-emerald-500",
              },
              {
                label: "In review",
                value: stats.inReview,
                className: "bg-amber-400",
              },
              {
                label: "Awaiting pay",
                value: stats.pendingPay,
                className: "bg-amber-400",
              },
              {
                label: "Rejected",
                value: stats.rejected,
                className: "bg-rose-400",
              },
            ]}
          />
          <div className="mt-6 space-y-4">
            <GoalRow
              label="Go live"
              current={stats.posted}
              total={Math.max(stats.total, 1)}
              hint="Posted vs all submissions"
            />
            <GoalRow
              label="Clear backlog"
              current={Math.max(0, stats.total - stats.pending)}
              total={Math.max(stats.total, 1)}
              hint={`${stats.pending} still in progress`}
            />
          </div>
        </DashPanel>

        <DashPanel className="xl:col-span-3" title="Next steps">
          <ProgressMeter
            value={postedPct}
            label="Publish rate"
            sublabel={
              stats.total === 0
                ? "Submit your first job to start tracking"
                : `${stats.posted} live of ${stats.total} posts`
            }
          />

          {nextPending ? (
            <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                Next action
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug">
                {nextPending.job.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {statusLabel(nextPending.job.status)}
              </p>
              <Button asChild className="mt-3 h-9 w-full rounded-full">
                <Link href={`/dashboard/jobs/${nextPending.job.id}`}>
                  Continue
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <Button asChild className="h-10 w-full rounded-full">
                <Link href="/dashboard/jobs/new">
                  <Plus className="size-4" />
                  Post another job
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-10 w-full rounded-full">
                <Link href="/dashboard/payments">
                  <Wallet className="size-4" />
                  Payments
                </Link>
              </Button>
            </div>
          )}
        </DashPanel>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Rejected"
          value={stats.rejected}
          hint="Needs edits & resubmit"
          icon={XCircle}
          tone="danger"
        />
        <KpiCard
          label="Awaiting payment"
          value={stats.pendingPay}
          hint="Upload screenshot to continue"
          icon={Wallet}
          tone="warning"
        />
        <KpiCard
          label="In review"
          value={stats.inReview}
          hint="Waiting on moderator"
          icon={Clock}
          tone="info"
        />
        <KpiCard
          label="Completion"
          value={`${postedPct}%`}
          hint="Posted / total"
          icon={CheckCircle2}
          tone="success"
        />
      </div>
    </div>
  );
}

function statusBadgeVariant(
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
