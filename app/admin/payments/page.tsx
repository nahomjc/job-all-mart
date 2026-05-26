import Link from "next/link";
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
import { paymentRepo } from "@/server/repositories/payment";
import { formatRelativeTime, statusLabel } from "@/lib/format";

export const metadata = { title: "Pending payments" };

export default async function AdminPaymentsPage() {
  const rows = await paymentRepo.pending(100);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pending payments</h1>
      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No pending payments.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Ref</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.amount}</TableCell>
                    <TableCell>{p.currency}</TableCell>
                    <TableCell>{statusLabel(p.method)}</TableCell>
                    <TableCell>{p.referenceCode ?? "—"}</TableCell>
                    <TableCell>
                      <Badge>{statusLabel(p.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelativeTime(p.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm">
                        <Link href={`/admin/jobs/${p.jobId}`}>Open job</Link>
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
