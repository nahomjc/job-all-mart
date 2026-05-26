import Link from "next/link";
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
import { jobRepo } from "@/server/repositories/job";
import { formatRelativeTime, statusLabel } from "@/lib/format";

export const metadata = { title: "Approval queue" };

interface SearchParams {
  status?: string;
}

export default async function AdminJobsQueuePage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await props.searchParams;
  const rows = await jobRepo.listAdminQueue({
    status: sp.status as never,
    limit: 100,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Approval queue</h1>
        <div className="flex gap-1">
          {(
            [
              ["pending_review", "Pending review"],
              ["pending_payment", "Pending payment"],
              ["approved", "Approved"],
              ["scheduled", "Scheduled"],
              ["posted", "Posted"],
              ["rejected", "Rejected"],
            ] as const
          ).map(([s, label]) => (
            <Button
              key={s}
              asChild
              variant={sp.status === s ? "default" : "outline"}
              size="sm"
            >
              <Link href={`/admin/jobs?status=${s}`}>{label}</Link>
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Queue is empty.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Employer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Spam</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead />
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
                    <TableCell className="text-muted-foreground">
                      {formatRelativeTime(job.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm">
                        <Link href={`/admin/jobs/${job.id}`}>Review</Link>
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
