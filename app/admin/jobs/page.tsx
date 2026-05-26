import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
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
import { PageHeader } from "@/components/page-header";
import { jobRepo } from "@/server/repositories/job";
import { formatRelativeTime, statusLabel } from "@/lib/format";

export const metadata = { title: "Approval queue" };

interface SearchParams {
  status?: string;
}

const STATUSES = [
  ["pending_review", "Pending review"],
  ["pending_payment", "Pending payment"],
  ["approved", "Approved"],
  ["scheduled", "Scheduled"],
  ["posted", "Posted"],
  ["rejected", "Rejected"],
] as const;

export default async function AdminJobsQueuePage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await props.searchParams;
  const rows = await jobRepo.listAdminQueue({
    status: sp.status as never,
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Moderation"
        title="Approval queue"
        description="Review job submissions before they go live on the channels."
      />

      <div className="flex flex-wrap gap-2">
        {STATUSES.map(([s, label]) => (
          <Button
            key={s}
            asChild
            variant={sp.status === s ? "default" : "outline"}
            size="sm"
          >
            <Link href={`/admin/jobs?status=${s}`}>{label}</Link>
          </Button>
        ))}
        {sp.status && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/jobs">Clear</Link>
          </Button>
        )}
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
