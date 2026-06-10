import Link from "next/link";
import { ArrowRight, Search, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { AdminUserCell } from "@/components/admin/admin-user-cell";
import { userRepo } from "@/server/repositories/user";
import { formatRelativeTime } from "@/lib/format";

export const metadata = { title: "Users" };

interface SearchParams {
  q?: string;
}

export default async function AdminUsersPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await props.searchParams;
  const q = (sp.q ?? "").trim();
  const rows = await userRepo.listForAdmin({ q: q || undefined, limit: 100 });
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Users"
        description="Everyone who has ever signed up via the web or linked their Telegram."
      />

      <form
        className="flex gap-2 rounded-xl border bg-card p-4"
        method="GET"
        action="/admin/users"
      >
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search name, email, Telegram username..."
            className="pl-8"
          />
        </div>
        <Button type="submit" size="sm">
          Search
        </Button>
        {q ? (
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/users">Reset</Link>
          </Button>
        ) : null}
      </form>

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
