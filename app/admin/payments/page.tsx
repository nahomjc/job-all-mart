import Link from "next/link";
import { Receipt } from "lucide-react";
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
import { paymentRepo } from "@/server/repositories/payment";
import { formatRelativeTime, statusLabel } from "@/lib/format";

export const metadata = { title: "Pending payments" };

export default async function AdminPaymentsPage() {
  const rows = await paymentRepo.pending(100);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Pending payments"
        description="Verify submitted payment screenshots before publishing the linked job."
      />

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Receipt className="size-6" />
              </span>
              <p className="text-sm text-muted-foreground">
                No pending payments — everything verified.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Ref</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right" />
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
                      <Badge variant="warning">{statusLabel(p.status)}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatRelativeTime(p.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
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
