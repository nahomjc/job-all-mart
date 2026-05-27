import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { AdminUserCell } from "@/components/admin/admin-user-cell";
import { userRepo } from "@/server/repositories/user";
import { formatRelativeTime } from "@/lib/format";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const rows = await userRepo.listForAdmin({ limit: 100 });
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Users"
        description="Everyone who has ever signed up via the web or linked their Telegram."
      />

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users className="size-6" />
              </span>
              <p className="text-sm text-muted-foreground">No users yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>User</TableHead>
                  <TableHead>Jobs</TableHead>
                  <TableHead>Telegram</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ user: u, jobCount, companyLogoUrl }) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <AdminUserCell
                        user={u}
                        companyLogoUrl={companyLogoUrl}
                        href={`/admin/users/${u.id}`}
                      />
                    </TableCell>
                    <TableCell className="tabular-nums">{jobCount}</TableCell>
                    <TableCell>
                      {u.telegramUsername
                        ? `@${u.telegramUsername}`
                        : (u.telegramId ?? "—")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{u.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.status === "active"
                            ? "success"
                            : u.status === "banned"
                              ? "destructive"
                              : "warning"
                        }
                        className="capitalize"
                      >
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatRelativeTime(u.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/users/${u.id}`}>
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
