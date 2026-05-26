import {
  Briefcase,
  CheckCircle2,
  Eye,
  MousePointerClick,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
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
    <div className="space-y-8">
      <PageHeader
        eyebrow="Analytics"
        title="Reach &amp; engagement"
        description="See how your posts are performing on the web and on Telegram."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total jobs"
          value={Number(totals?.totalJobs ?? 0)}
          icon={Briefcase}
          tone="primary"
        />
        <StatCard
          label="Posted"
          value={Number(totals?.posted ?? 0)}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Total views"
          value={totalViews.toLocaleString()}
          icon={Eye}
          tone="violet"
        />
        <StatCard
          label="Telegram clicks"
          value={Number(tgClickRows[0]?.total ?? 0).toLocaleString()}
          icon={MousePointerClick}
          tone="info"
        />
      </div>
    </div>
  );
}
