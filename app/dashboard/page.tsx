import Link from "next/link";
import { Plus, Briefcase, Clock, CheckCircle2, XCircle } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            {user.displayName ?? user.email}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/jobs/new">
            <Plus className="size-4" />
            New job post
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Briefcase className="size-4" />} label="Total" value={stats.total} />
        <StatCard icon={<Clock className="size-4" />} label="In progress" value={stats.pending} accent="warning" />
        <StatCard icon={<CheckCircle2 className="size-4" />} label="Posted" value={stats.posted} accent="success" />
        <StatCard icon={<XCircle className="size-4" />} label="Rejected" value={stats.rejected} accent="destructive" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border-b p-4">
            <h2 className="font-semibold">Recent posts</h2>
          </div>
          {rows.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              You haven&apos;t submitted any jobs yet.{" "}
              <Link href="/dashboard/jobs/new" className="text-primary">
                Start your first post →
              </Link>
            </div>
          ) : (
            <ul className="divide-y">
              {rows.slice(0, 6).map(({ job, category }) => (
                <li key={job.id} className="flex items-center justify-between p-4">
                  <div>
                    <Link
                      href={`/dashboard/jobs/${job.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {job.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {category?.name ?? "Uncategorized"} · {formatRelativeTime(job.createdAt)}
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

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: "warning" | "success" | "destructive";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          {label}
        </div>
        <p
          className={`mt-2 text-3xl font-bold ${
            accent === "warning"
              ? "text-amber-500"
              : accent === "success"
              ? "text-emerald-600"
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
