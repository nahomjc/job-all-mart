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
import { UserRowActions } from "@/components/admin/user-row-actions";
import { userRepo } from "@/server/repositories/user";
import { formatRelativeTime } from "@/lib/format";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const rows = await userRepo.list({ limit: 100 });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No users yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telegram</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.displayName ?? "—"}
                    </TableCell>
                    <TableCell>{u.email ?? "—"}</TableCell>
                    <TableCell>
                      {u.telegramUsername
                        ? `@${u.telegramUsername}`
                        : (u.telegramId ?? "—")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{u.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{u.role}</Badge>
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
                      >
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelativeTime(u.createdAt)}
                    </TableCell>
                    <TableCell>
                      <UserRowActions userId={u.id} status={u.status} />
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
