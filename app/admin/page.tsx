import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  MousePointerClick,
  Receipt,
  Users,
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
import { db } from "@/server/db/client";
import { jobs, payments, users, telegramPosts } from "@/server/db/schema";
import { count, desc, eq, sql } from "drizzle-orm";
import { formatRelativeTime, statusLabel } from "@/lib/format";

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
        payment: sql<number>`count(*) filter (where ${jobs.status} = 'pending_payment')`,
        posted: sql<number>`count(*) filter (where ${jobs.status} = 'posted')`,
        rejected: sql<number>`count(*) filter (where ${jobs.status} = 'rejected')`,
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
  const pendingPayJobs = Number(jobTotals?.payment ?? 0);
  const pendingPayments = Number(paymentTotals?.pending ?? 0);
  const totalJobs = Number(jobTotals?.total ?? 0);
  const postedJobs = Number(jobTotals?.posted ?? 0);
  const rejectedJobs = Number(jobTotals?.rejected ?? 0);
  const postedPct =
    totalJobs > 0 ? Math.round((postedJobs / totalJobs) * 100) : 0;
  const revenue = Number(paymentTotals?.revenueMinor ?? 0);
  const clicks = Number(tgTotals?.clicks ?? 0);
  const activeUsers = Number(userTotals?.active ?? 0);
  const totalUsers = Number(userTotals?.total ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Admin workspace</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Track submissions, payments, and Telegram publishing health.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="h-10 rounded-full px-4">
            <Link href="/admin/audit">Audit logs</Link>
          </Button>
          <Button asChild className="h-10 rounded-full px-4">
            <Link href="/admin/jobs?status=pending_review">
              Review queue
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <DashPanel
          className="xl:col-span-7"
          title="Jobs overview"
          description="Distribution across the publishing pipeline"
          action={
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              All time
            </span>
          }
        >
          <OverviewBars
            items={[
              { label: "Posted", value: postedJobs, color: "bg-emerald-500/90" },
              { label: "Review", value: pendingReview, color: "bg-amber-400" },
              { label: "Payment", value: pendingPayJobs, color: "bg-sky-400" },
              { label: "Rejected", value: rejectedJobs, color: "bg-rose-400/90" },
            ]}
          />
        </DashPanel>

        <div className="grid gap-4 sm:grid-cols-3 xl:col-span-5 xl:grid-cols-1">
          <KpiCard
            label="Verified revenue"
            value={`$${revenue.toLocaleString()}`}
            delta={pendingPayments > 0 ? `${pendingPayments} pending` : "All clear"}
            deltaTone={pendingPayments > 0 ? "muted" : "success"}
            hint="verified payments"
            icon={DollarSign}
            tone="success"
          />
          <KpiCard
            label="Awaiting review"
            value={pendingReview}
            delta={pendingReview > 0 ? "Needs action" : "Queue clear"}
            deltaTone={pendingReview > 0 ? "danger" : "success"}
            hint="jobs in approval"
            icon={Clock}
            tone="warning"
          />
          <KpiCard
            label="Live posts"
            value={postedJobs}
            delta={`+${postedPct}%`}
            hint="of total jobs"
            icon={CheckCircle2}
            tone="info"
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <DashPanel
          className="xl:col-span-5"
          title="Approval queue"
          description="Newest jobs waiting for review"
          contentClassName="p-0"
          action={
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/admin/jobs?status=pending_review">
                See all <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          }
        >
          {queueJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                <CheckCircle2 className="size-5" />
              </span>
              <p className="text-sm font-medium">Queue is clear</p>
              <p className="text-xs text-muted-foreground">
                Nothing waiting for approval right now.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {queueJobs.map((job) => (
                <li key={job.id}>
                  <Link
                    href={`/admin/jobs/${job.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                      <Briefcase className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{job.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {job.company || "Unknown company"} ·{" "}
                        {formatRelativeTime(job.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant="warning" className="rounded-full">
                        {statusLabel(job.status)}
                      </Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DashPanel>

        <DashPanel
          className="xl:col-span-4"
          title="Pipeline mix"
          description="Where jobs sit today"
        >
          <SegmentedBar
            segments={[
              {
                label: "Posted",
                value: postedJobs,
                className: "bg-emerald-500",
              },
              {
                label: "In review",
                value: pendingReview,
                className: "bg-amber-400",
              },
              {
                label: "Awaiting pay",
                value: pendingPayJobs,
                className: "bg-sky-400",
              },
              {
                label: "Rejected",
                value: rejectedJobs,
                className: "bg-rose-400",
              },
            ]}
          />
          <div className="mt-6 space-y-4">
            <GoalRow
              label="Review SLA"
              current={Math.max(0, 10 - pendingReview)}
              total={10}
              hint={
                pendingReview > 10
                  ? `${pendingReview - 10} over soft capacity`
                  : "Under soft review capacity"
              }
            />
            <GoalRow
              label="Payment verification"
              current={Math.max(0, 8 - pendingPayments)}
              total={8}
              hint={`${pendingPayments} screenshot${pendingPayments === 1 ? "" : "s"} waiting`}
            />
          </div>
        </DashPanel>

        <DashPanel className="xl:col-span-3" title="Publishing health">
          <ProgressMeter
            value={postedPct}
            label="Jobs published"
            sublabel={`${postedJobs} of ${totalJobs} submissions reached posted status`}
          />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <QuickAction href="/admin/payments" label="Payments" icon={Receipt} />
            <QuickAction href="/admin/users" label="Users" icon={Users} />
            <QuickAction
              href="/admin/jobs?status=pending_review"
              label="Queue"
              icon={Clock}
            />
            <QuickAction
              href="/admin/settings"
              label="Settings"
              icon={MousePointerClick}
            />
          </div>
        </DashPanel>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Telegram clicks"
          value={clicks.toLocaleString()}
          hint="from published posts"
          icon={MousePointerClick}
          tone="info"
        />
        <KpiCard
          label="Telegram posts"
          value={Number(tgTotals?.posts ?? 0).toLocaleString()}
          hint="messages delivered"
          icon={Briefcase}
          tone="default"
        />
        <KpiCard
          label="Active users"
          value={activeUsers.toLocaleString()}
          delta={`${totalUsers} total`}
          deltaTone="muted"
          icon={Users}
          tone="success"
        />
        <KpiCard
          label="Pending payments"
          value={pendingPayments}
          delta={pendingPayments > 0 ? "Verify soon" : "Caught up"}
          deltaTone={pendingPayments > 0 ? "danger" : "success"}
          icon={Receipt}
          tone="warning"
        />
      </div>
    </div>
  );
}

function QuickAction({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-muted/30 px-2 py-3 text-center transition-colors hover:bg-muted/60"
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-background shadow-sm">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <span className="text-[11px] font-medium">{label}</span>
    </Link>
  );
}
