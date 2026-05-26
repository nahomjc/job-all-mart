import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Plus,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
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
  };

  const recent = rows.slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back${user.displayName ? `, ${user.displayName.split(/\s+/)[0]}` : ""}`}
        description="Track your job posts, payments, and Telegram reach all in one place."
        actions={
          <Button asChild>
            <Link href="/dashboard/jobs/new">
              <Plus className="size-4" />
              New job post
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total posts"
          value={stats.total}
          icon={Briefcase}
          tone="primary"
        />
        <StatCard
          label="In progress"
          value={stats.pending}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Posted"
          value={stats.posted}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          icon={XCircle}
          tone="destructive"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Recent activity
              </p>
              <h2 className="mt-0.5 font-semibold">Your latest posts</h2>
            </div>
            {rows.length > 0 && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/jobs">
                  See all <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            )}
          </div>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Briefcase className="size-6" />
              </span>
              <p className="text-sm text-muted-foreground">
                You haven&apos;t submitted any jobs yet.
              </p>
              <Button asChild size="sm">
                <Link href="/dashboard/jobs/new">
                  <Plus className="size-4" /> Start your first post
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {recent.map(({ job, category }) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/jobs/${job.id}`}
                      className="line-clamp-1 font-medium hover:text-primary"
                    >
                      {job.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {category?.name ?? "Uncategorized"} ·{" "}
                      {formatRelativeTime(job.createdAt)}
                    </p>
                  </div>
                  <Badge variant={statusBadgeVariant(job.status)}>
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
