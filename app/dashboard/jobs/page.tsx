import Link from "next/link";
import { Plus } from "lucide-react";
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
import { requireUser } from "@/lib/auth";
import { jobRepo } from "@/server/repositories/job";
import { formatRelativeTime, formatSalary, statusLabel } from "@/lib/format";

export const metadata = { title: "My jobs" };

export default async function MyJobsPage() {
  const user = await requireUser();
  const rows = await jobRepo.listByUser(user.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My jobs</h1>
        <Button asChild>
          <Link href="/dashboard/jobs/new">
            <Plus className="size-4" />
            New post
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              You haven&apos;t created any posts yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead />
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
                      <Badge>{statusLabel(job.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelativeTime(job.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/jobs/${job.id}`}>View</Link>
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
