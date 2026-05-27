import Link from "next/link";
import { Receipt, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { paymentRepo } from "@/server/repositories/payment";
import { formatRelativeTime, statusLabel } from "@/lib/format";

export const metadata = { title: "Payments" };

interface SearchParams {
  status?: string;
  q?: string;
  sortBy?: string;
  sortDir?: string;
}

const STATUSES = [
  ["all", "All statuses"],
  ["pending", "Pending"],
  ["verified", "Verified"],
  ["rejected", "Rejected"],
] as const;

const SORT_OPTIONS = [
  ["createdAt", "Created time"],
  ["updatedAt", "Updated time"],
  ["amount", "Amount"],
  ["method", "Method"],
  ["status", "Status"],
] as const;

const SORT_DIR_OPTIONS = [
  ["desc", "Newest first"],
  ["asc", "Oldest first"],
] as const;

export default async function AdminPaymentsPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await props.searchParams;
  const status = normalizeStatus(sp.status);
  const q = (sp.q ?? "").trim();
  const sortBy = normalizeSortBy(sp.sortBy);
  const sortDir = normalizeSortDir(sp.sortDir);

  const rows = await paymentRepo.listAdminPayments({
    statuses: status === "all" ? undefined : [status],
    q: q || undefined,
    sortBy,
    sortDir,
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Payments"
        description="Verify submitted payment screenshots before publishing the linked job."
      />

      <form
        className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_auto_auto_auto]"
        method="GET"
        action="/admin/payments"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search reference, method, job title..."
            className="pl-8"
          />
        </div>

        <select
          name="status"
          defaultValue={status}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
        >
          {STATUSES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          name="sortBy"
          defaultValue={sortBy}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
        >
          {SORT_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              Sort: {label}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <select
            name="sortDir"
            defaultValue={sortDir}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
          >
            {SORT_DIR_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm">
            Apply
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/payments">Reset</Link>
          </Button>
        </div>
      </form>

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Receipt className="size-6" />
              </span>
              <p className="text-sm text-muted-foreground">
                No payments match your filters.
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
                {rows.map(({ payment: p }) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.amount}</TableCell>
                    <TableCell>{p.currency}</TableCell>
                    <TableCell>{statusLabel(p.method)}</TableCell>
                    <TableCell>{p.referenceCode ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={paymentBadgeVariant(p.status)}>
                        {statusLabel(p.status)}
                      </Badge>
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

function normalizeStatus(status: string | undefined): "all" | "pending" | "verified" | "rejected" {
  const value = status ?? "all";
  const allowed = new Set<string>(STATUSES.map(([s]) => s));
  if (!allowed.has(value)) return "all";
  return value as "all" | "pending" | "verified" | "rejected";
}

function normalizeSortBy(
  sortBy: string | undefined,
): "createdAt" | "updatedAt" | "amount" | "method" | "status" {
  if (
    sortBy === "updatedAt" ||
    sortBy === "amount" ||
    sortBy === "method" ||
    sortBy === "status"
  ) {
    return sortBy;
  }
  return "createdAt";
}

function normalizeSortDir(sortDir: string | undefined): "asc" | "desc" {
  return sortDir === "asc" ? "asc" : "desc";
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
      return "destructive";
    default:
      return "secondary";
  }
}
