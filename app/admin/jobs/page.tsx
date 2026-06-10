import Link from "next/link";
import { ArrowRight, Inbox, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { jobRepo } from "@/server/repositories/job";
import { formatRelativeTime, statusLabel } from "@/lib/format";
import type { Job } from "@/server/db/schema";

export const metadata = { title: "Approval queue" };

interface SearchParams {
  status?: string;
  q?: string;
  sortBy?: string;
  sortDir?: string;
}

const STATUSES = [
  ["all", "All statuses"],
  ["pending_review", "Pending review"],
  ["pending_payment", "Pending payment"],
  ["approved", "Approved"],
  ["scheduled", "Scheduled"],
  ["posted", "Posted"],
  ["rejected", "Rejected"],
] as const;
const SORT_OPTIONS = [
  ["createdAt", "Created time"],
  ["updatedAt", "Updated time"],
  ["spamScore", "Spam score"],
  ["title", "Title"],
] as const;
const SORT_DIR_OPTIONS = [
  ["desc", "Descending"],
  ["asc", "Ascending"],
] as const;

export default async function AdminJobsQueuePage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await props.searchParams;
  const status = normalizeStatus(sp.status);
  const sortBy = normalizeSortBy(sp.sortBy);
  const sortDir = normalizeSortDir(sp.sortDir);
  const q = (sp.q ?? "").trim();

  const rows = await jobRepo.listAdminQueue({
    statuses: status === "all" ? undefined : [status],
    q,
    sortBy,
    sortDir,
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Moderation"
        title="Approval queue"
        description="Review job submissions before they go live on the channels."
      />

      <form
        className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_auto_auto_auto]"
        method="GET"
        action="/admin/jobs"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search title, company, employer..."
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
            <Link href="/admin/jobs">Reset</Link>
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map(([s, label]) => (
          <Button
            key={s}
            asChild
            variant={status === s ? "default" : "outline"}
            size="sm"
          >
            <Link href={buildStatusHref(sp, s)}>{label}</Link>
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <EmptyState />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Title</TableHead>
                  <TableHead>Employer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Spam</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ job, employer, category }) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>
                      {employer?.displayName ?? employer?.email ?? "—"}
                      {employer?.telegramUsername && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          @{employer.telegramUsername}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{category?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{job.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          job.spamScore >= 50
                            ? "destructive"
                            : job.spamScore >= 20
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {job.spamScore}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{statusLabel(job.status)}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatRelativeTime(job.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm">
                        <Link href={`/admin/jobs/${job.id}`}>
                          Review <ArrowRight className="size-3.5" />
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
  value: string | undefined,
): "createdAt" | "updatedAt" | "spamScore" | "title" {
  if (value === "updatedAt" || value === "spamScore" || value === "title") {
    return value;
  }
  return "createdAt";
}

function normalizeSortDir(value: string | undefined): "asc" | "desc" {
  return value === "asc" ? "asc" : "desc";
}

function buildStatusHref(sp: SearchParams, status: string): string {
  const params = new URLSearchParams();
  if (sp.q) params.set("q", sp.q);
  if (sp.sortBy) params.set("sortBy", sp.sortBy);
  if (sp.sortDir) params.set("sortDir", sp.sortDir);
  if (status !== "all") params.set("status", status);
  const qs = params.toString();
  return qs ? `/admin/jobs?${qs}` : "/admin/jobs";
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Inbox className="size-6" />
      </span>
      <p className="text-sm text-muted-foreground">
        Queue is empty — all clear.
      </p>
    </div>
  );
}
