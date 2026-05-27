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
import { requireUser } from "@/lib/auth";
import { paymentRepo } from "@/server/repositories/payment";
import { formatRelativeTime, statusLabel } from "@/lib/format";

export const metadata = { title: "My payments" };

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

export default async function MyPaymentsPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();
  const sp = await props.searchParams;
  const status = normalizeStatus(sp.status);
  const q = (sp.q ?? "").trim();
  const sortBy = normalizeSortBy(sp.sortBy);
  const sortDir = normalizeSortDir(sp.sortDir);

  const rows = await paymentRepo.listDashboardPayments({
    userId: user.id,
    statuses: status === "all" ? undefined : [status],
    q: q || undefined,
    sortBy,
    sortDir,
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Payments"
        description="Your payment submissions and their verification status."
      />

      <form
        className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_auto_auto_auto]"
        method="GET"
        action="/dashboard/payments"
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
          <button type="submit" className="h-9 px-3 text-sm">
            Apply
          </button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/payments">Reset</Link>
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
                {rows.map(({ payment: p }) => (
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
    case "refunded":
      return "destructive";
    default:
      return "secondary";
  }
}
