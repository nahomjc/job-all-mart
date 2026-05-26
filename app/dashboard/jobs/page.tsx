import Link from "next/link";
import { ArrowRight, Briefcase, Plus } from "lucide-react";
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
import { requireUser } from "@/lib/auth";
import { jobRepo } from "@/server/repositories/job";
import { formatRelativeTime, formatSalary, statusLabel } from "@/lib/format";

export const metadata = { title: "My jobs" };

export default async function MyJobsPage() {
  const user = await requireUser();
  const rows = await jobRepo.listByUser(user.id);

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
