import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Plus,
  Video,
  XCircle,
} from "lucide-react";
import { StatusChart } from "@/components/dashboard/status-chart";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const recent = rows.slice(0, 5);
  const nextPending = rows.find((r) =>
    ["pending_payment", "pending_review"].includes(r.job.status),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Plan, prioritize, and track your job posts with ease."
        actions={
          <>
            <Button asChild variant="outline" className="h-10 rounded-xl">
              <Link href="/dashboard/jobs">View all jobs</Link>
            </Button>
            <Button asChild className="h-10 rounded-xl">
              <Link href="/dashboard/jobs/new">
                <Plus className="size-4" />
                New job post
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total posts"
          value={stats.total}
          icon={Briefcase}
          featured
          trend={{
            direction: "up",
            label: "All submissions on your account",
          }}
        />
        <StatCard
          label="In progress"
          value={stats.pending}
          icon={Clock}
          tone="warning"
          trend={{ direction: "flat", label: "Awaiting payment or review" }}
        />
        <StatCard
          label="Posted"
          value={stats.posted}
          icon={CheckCircle2}
          tone="success"
          trend={{ direction: "up", label: "Live on site & Telegram" }}
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          icon={XCircle}
          tone="destructive"
          trend={{ direction: "flat", label: "Needs edits & resubmit" }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StatusChart
            posted={stats.posted}
            inReview={stats.inReview}
            pendingPay={stats.pendingPay}
            rejected={stats.rejected}
          />
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Reminders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {nextPending ? (
              <>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-primary">
                    Next action
                  </p>
                  <p className="mt-1 font-semibold leading-snug">
                    {nextPending.job.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Status: {statusLabel(nextPending.job.status)}
                  </p>
                </div>
                <Button asChild className="h-10 w-full rounded-xl">
                  <Link href={`/dashboard/jobs/${nextPending.job.id}`}>
                    <Video className="size-4" />
                    Open job
                  </Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No pending actions. You&apos;re all caught up.
              </p>
            )}
            <Button asChild variant="outline" className="h-10 w-full rounded-xl">
              <Link href="/dashboard/jobs/new">
                <Plus className="size-4" />
                Post another job
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/60 pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Recent posts</CardTitle>
            <p className="text-xs text-muted-foreground">Your latest submissions</p>
          </div>
          {rows.length > 0 && (
            <Button asChild variant="ghost" size="sm" className="rounded-lg">
              <Link href="/dashboard/jobs">
                See all <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Briefcase className="size-6" />
              </span>
              <p className="text-sm text-muted-foreground">
                You haven&apos;t submitted any jobs yet.
              </p>
              <Button asChild size="sm" className="rounded-xl">
                <Link href="/dashboard/jobs/new">
                  <Plus className="size-4" /> Start your first post
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {recent.map(({ job, category }) => (
                <li
                  key={job.id}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Briefcase className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/jobs/${job.id}`}
                      className="line-clamp-1 font-medium hover:text-primary"
                    >
                      {job.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {category?.name ?? "Uncategorized"} · Due{" "}
                      {formatRelativeTime(job.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={statusBadgeVariant(job.status)}
                    className="shrink-0 rounded-lg"
                  >
                    {statusLabel(job.status)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
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
