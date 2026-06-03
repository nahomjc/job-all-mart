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
  UserCheck,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/server/db/client";
import { jobs, payments, users, telegramPosts } from "@/server/db/schema";
import { count, sql } from "drizzle-orm";

export const metadata = { title: "Admin overview" };

export default async function AdminOverviewPage() {
  const [
    [jobTotals],
    [paymentTotals],
    [userTotals],
    [tgTotals],
  ] = await Promise.all([
    db
      .select({
        total: count(),
        pending: sql<number>`count(*) filter (where ${jobs.status} in ('pending_review','pending_payment'))`,
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
  ]);

  const pendingReview = Number(jobTotals?.pending ?? 0);
  const pendingPayments = Number(paymentTotals?.pending ?? 0);
  const totalJobs = Number(jobTotals?.total ?? 0);
  const postedJobs = Number(jobTotals?.posted ?? 0);
  const postedPct =
    totalJobs > 0 ? Math.round((postedJobs / totalJobs) * 100) : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Platform health — submissions, payments, users, and Telegram delivery."
        actions={
          <>
            <Button asChild variant="outline" className="h-10 rounded-xl">
              <Link href="/admin/audit">Audit logs</Link>
            </Button>
            <Button asChild className="h-10 rounded-xl">
              <Link href="/admin/jobs?status=pending_review">
                Review queue <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total jobs"
          value={totalJobs}
          icon={Briefcase}
          featured
          trend={{ direction: "up", label: "All platform submissions" }}
        />
        <StatCard
          label="Posted"
          value={postedJobs}
          icon={CheckCircle2}
          tone="success"
          trend={{ direction: "up", label: "Live on public site" }}
        />
        <StatCard
          label="Awaiting review"
          value={pendingReview}
          icon={Clock}
          tone="warning"
          trend={{ direction: "flat", label: "Needs admin action" }}
        />
        <StatCard
          label="Pending payments"
          value={pendingPayments}
          icon={Receipt}
          tone="info"
          trend={{ direction: "flat", label: "To verify" }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-amber-200/80 bg-amber-50/60 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/5 lg:col-span-1">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
            <div className="flex items-start gap-4">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                <Clock className="size-6" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Approval queue</p>
                <p className="text-3xl font-bold tracking-tight">{pendingReview}</p>
                <p className="text-xs text-muted-foreground">jobs waiting</p>
              </div>
            </div>
            <Button asChild className="h-10 w-full rounded-xl">
              <Link href="/admin/jobs?status=pending_review">Open queue</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5 shadow-sm lg:col-span-1">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
            <div className="flex items-start gap-4">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Receipt className="size-6" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Payments</p>
                <p className="text-3xl font-bold tracking-tight">{pendingPayments}</p>
                <p className="text-xs text-muted-foreground">screenshots to verify</p>
              </div>
            </div>
            <Button asChild variant="outline" className="h-10 w-full rounded-xl">
              <Link href="/admin/payments">Verify payments</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Job progress</CardTitle>
            <p className="text-xs text-muted-foreground">Posted vs total</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-6">
            <div
              className="relative flex size-28 items-center justify-center rounded-full border-[10px] border-primary/20"
              style={{
                background: `conic-gradient(var(--primary) ${postedPct}%, var(--muted) 0)`,
              }}
            >
              <span className="flex size-[4.5rem] flex-col items-center justify-center rounded-full bg-card text-center">
                <span className="text-xl font-bold">{postedPct}%</span>
                <span className="text-[10px] text-muted-foreground">posted</span>
              </span>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary" />
                Posted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-muted-foreground/40" />
                Other
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
          Key metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Revenue (verified)"
            value={`$${Number(paymentTotals?.revenueMinor ?? 0)}`}
            icon={DollarSign}
            tone="success"
          />
          <StatCard
            label="Telegram clicks"
            value={Number(tgTotals?.clicks ?? 0)}
            icon={MousePointerClick}
            tone="info"
          />
          <StatCard
            label="Active users"
            value={Number(userTotals?.active ?? 0)}
            icon={UserCheck}
            tone="primary"
          />
          <StatCard
            label="Total users"
            value={Number(userTotals?.total ?? 0)}
            icon={Users}
            tone="violet"
          />
          <StatCard
            label="Banned users"
            value={Number(userTotals?.banned ?? 0)}
            icon={Ban}
            tone="destructive"
          />
          <StatCard
            label="Telegram posts"
            value={Number(tgTotals?.posts ?? 0)}
            icon={Briefcase}
            tone="info"
          />
        </div>
      </div>
    </div>
  );
}
