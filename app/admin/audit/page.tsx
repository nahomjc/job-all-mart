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
import { auditLogRepo } from "@/server/repositories/auditLog";
import { formatRelativeTime } from "@/lib/format";

export const metadata = { title: "Audit log" };

export default async function AdminAuditPage() {
  const rows = await auditLogRepo.list(200);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audit log</h1>
      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No entries yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatRelativeTime(r.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.action}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {r.targetType}:{r.targetId?.slice(0, 8) ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[400px] truncate font-mono text-xs text-muted-foreground">
                      {r.metadata ? JSON.stringify(r.metadata) : "—"}
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
