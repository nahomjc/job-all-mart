import { ScrollText } from "lucide-react";
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
import { PageHeader } from "@/components/page-header";
import { auditLogRepo } from "@/server/repositories/auditLog";
import { formatRelativeTime } from "@/lib/format";

export const metadata = { title: "Audit log" };

export default async function AdminAuditPage() {
  const rows = await auditLogRepo.list(200);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compliance"
        title="Audit log"
        description="A tamper-evident history of every admin and system action."
      />

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ScrollText className="size-6" />
              </span>
              <p className="text-sm text-muted-foreground">No entries yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
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
