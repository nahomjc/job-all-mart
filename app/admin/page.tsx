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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total jobs" value={Number(jobTotals?.total ?? 0)} />
        <Stat
          label="Pending review"
          value={Number(jobTotals?.pending ?? 0)}
          accent="warning"
        />
        <Stat label="Posted" value={Number(jobTotals?.posted ?? 0)} />
        <Stat
          label="Pending payments"
          value={Number(paymentTotals?.pending ?? 0)}
          accent="warning"
        />
        <Stat
          label="Revenue (verified)"
          value={`$${Number(paymentTotals?.revenueMinor ?? 0)}`}
        />
        <Stat label="Active users" value={Number(userTotals?.active ?? 0)} />
        <Stat
          label="Banned users"
          value={Number(userTotals?.banned ?? 0)}
          accent="destructive"
        />
        <Stat label="Telegram clicks" value={Number(tgTotals?.clicks ?? 0)} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "warning" | "destructive";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p
          className={`mt-2 text-3xl font-bold ${
            accent === "warning"
              ? "text-amber-500"
              : accent === "destructive"
              ? "text-destructive"
              : ""
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
