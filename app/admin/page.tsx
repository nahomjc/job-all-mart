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
import { Card, CardContent } from "@/components/ui/card";
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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Platform overview"
        description="Real-time health of submissions, payments, users, and Telegram delivery."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/audit">Audit logs</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/jobs?status=pending_review">
                Review queue <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        }
      />

      {/* Highlights row — what needs attention */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="overflow-hidden border-amber-200 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex size-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
              <Clock className="size-6" />
            </span>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Awaiting review</p>
              <p className="text-2xl font-bold tracking-tight">
                {pendingReview}{" "}
                <span className="text-base font-medium text-muted-foreground">
                  jobs
                </span>
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/jobs?status=pending_review">Open queue</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Receipt className="size-6" />
            </span>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Pending payments</p>
              <p className="text-2xl font-bold tracking-tight">
                {pendingPayments}{" "}
                <span className="text-base font-medium text-muted-foreground">
                  to verify
                </span>
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/admin/payments">Verify</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Metric grid */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Key metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total jobs"
            value={Number(jobTotals?.total ?? 0)}
            icon={Briefcase}
            tone="primary"
          />
          <StatCard
            label="Posted"
            value={Number(jobTotals?.posted ?? 0)}
            icon={CheckCircle2}
            tone="success"
          />
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
