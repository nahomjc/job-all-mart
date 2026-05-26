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
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { paymentRepo } from "@/server/repositories/payment";
import { formatRelativeTime, statusLabel } from "@/lib/format";

export const metadata = { title: "My payments" };

export default async function MyPaymentsPage() {
  const user = await requireUser();
  const rows = await paymentRepo.listByUser(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Payments"
        description="Your payment submissions and their verification status."
      />

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Receipt className="size-6" />
              </span>
              <p className="text-sm text-muted-foreground">
                No payments yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.amount} {p.currency}
                    </TableCell>
                    <TableCell>{statusLabel(p.method)}</TableCell>
                    <TableCell>
                      <Badge variant={paymentBadgeVariant(p.status)}>
                        {statusLabel(p.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {p.referenceCode ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatRelativeTime(p.createdAt)}
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

function paymentBadgeVariant(
  status: string,
): "default" | "secondary" | "success" | "warning" | "destructive" | "outline" {
  switch (status) {
    case "verified":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
    case "refunded":
      return "destructive";
    default:
      return "secondary";
  }
}
