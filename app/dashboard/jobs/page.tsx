import Link from "next/link";
import { ArrowRight, Briefcase, Plus, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth";
import { jobRepo } from "@/server/repositories/job";
import { formatRelativeTime, formatSalary, statusLabel } from "@/lib/format";
import type { Job } from "@/server/db/schema";

export const metadata = { title: "My jobs" };

interface SearchParams {
  status?: string;
  q?: string;
  sortBy?: string;
  sortDir?: string;
}

const STATUSES = [
  ["all", "All statuses"],
  ["approved", "Approved"],
  ["scheduled", "Scheduled"],
  ["rejected", "Rejected"],
  ["posted", "Posted"],
  ["pending_review", "Pending review"],
  ["pending_payment", "Pending payment"],
  ["draft", "Draft"],
  ["expired", "Expired"],
] as const;

const SORT_OPTIONS = [
  ["createdAt", "Created time"],
  ["updatedAt", "Updated time"],
  ["spamScore", "Spam score"],
  ["title", "Title"],
] as const;

const SORT_DIR_OPTIONS = [
  ["desc", "Newest first"],
  ["asc", "Oldest first"],
] as const;

export default async function MyJobsPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();
  const sp = await props.searchParams;

  const status = normalizeStatus(sp.status);
  const q = (sp.q ?? "").trim();
  const sortBy = normalizeSortBy(sp.sortBy);
  const sortDir = normalizeSortDir(sp.sortDir);

  const rows = await jobRepo.listDashboardJobs({
    userId: user.id,
    statuses: status === "all" ? undefined : [status],
    q: q || undefined,
    sortBy,
    sortDir,
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Posts"
        title="My jobs"
        description="All your submissions — pending, posted, and archived."
        actions={
          <Button asChild>
            <Link href="/dashboard/jobs/new">
              <Plus className="size-4" /> New post
            </Link>
          </Button>
        }
      />

      <form
        className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_auto_auto_auto]"
        method="GET"
        action="/dashboard/jobs"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search title, company, description..."
            className="pl-8"
          />
        </div>

        <select
          name="status"
          defaultValue={status}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
        >
          {STATUSES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          name="sortBy"
          defaultValue={sortBy}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
        >
          {SORT_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              Sort: {label}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <select
            name="sortDir"
            defaultValue={sortDir}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
          >
            {SORT_DIR_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm">
            Apply
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/jobs">Reset</Link>
          </Button>
        </div>
      </form>

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Briefcase className="size-6" />
              </span>
              <p className="text-sm text-muted-foreground">
                You haven&apos;t created any posts yet.
              </p>
              <Button asChild size="sm">
                <Link href="/dashboard/jobs/new">
                  <Plus className="size-4" /> Start your first post
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ job, category }) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{category?.name ?? "—"}</TableCell>
                    <TableCell>
                      {formatSalary(
                        job.salaryMin,
                        job.salaryMax,
                        job.salaryCurrency,
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(job.status)}>
                        {statusLabel(job.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatRelativeTime(job.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/jobs/${job.id}`}>
                          View <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function normalizeStatus(status: string | undefined): "all" | Job["status"] {
  const value = status ?? "all";
  const allowed = new Set<string>(STATUSES.map(([s]) => s));
  if (!allowed.has(value)) return "all";
  return value as "all" | Job["status"];
}

function normalizeSortBy(
  sortBy: string | undefined,
): "createdAt" | "updatedAt" | "spamScore" | "title" {
  if (sortBy === "updatedAt" || sortBy === "spamScore" || sortBy === "title")
    return sortBy;
  return "createdAt";
}

function normalizeSortDir(sortDir: string | undefined): "asc" | "desc" {
  return sortDir === "asc" ? "asc" : "desc";
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
