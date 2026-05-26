import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { db } from "@/server/db/client";
import { jobs, jobViews, telegramPosts } from "@/server/db/schema";
import { count, eq, sql } from "drizzle-orm";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const user = await requireUser();

  const [totals] = await db
    .select({
      totalJobs: count(),
      posted: sql<number>`count(*) filter (where ${jobs.status} = 'posted')`,
    })
    .from(jobs)
    .where(eq(jobs.userId, user.id));

  const myViewRows = await db
    .select({
      jobId: jobViews.jobId,
      total: count(),
    })
    .from(jobViews)
    .innerJoin(jobs, eq(jobs.id, jobViews.jobId))
    .where(eq(jobs.userId, user.id))
    .groupBy(jobViews.jobId);

  const totalViews = myViewRows.reduce((acc, r) => acc + Number(r.total), 0);

  const tgClickRows = await db
    .select({
      total: sql<number>`coalesce(sum(${telegramPosts.clickCount}), 0)`,
    })
    .from(telegramPosts)
    .innerJoin(jobs, eq(jobs.id, telegramPosts.jobId))
    .where(eq(jobs.userId, user.id));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total jobs" value={Number(totals?.totalJobs ?? 0)} />
        <Stat label="Posted" value={Number(totals?.posted ?? 0)} />
        <Stat label="Total views" value={totalViews} />
        <Stat label="Telegram clicks" value={Number(tgClickRows[0]?.total ?? 0)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
