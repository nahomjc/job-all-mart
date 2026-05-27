import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  AtSign,
  Briefcase,
  Calendar,
  Mail,
  Receipt,
  Send,
  Shield,
  User,
} from "lucide-react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { AdminUserCell } from "@/components/admin/admin-user-cell";
import { UpdateUserRoleForm } from "@/components/admin/update-user-role";
import { UserRowActions } from "@/components/admin/user-row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelativeTime, statusLabel } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth";
import { userDisplayName } from "@/lib/user-display";
import { userRepo } from "@/server/repositories/user";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const user = await userRepo.byId(id);
  return {
    title: user ? userDisplayName(user) : "User profile",
  };
}

export default async function AdminUserDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const [profile, actor] = await Promise.all([
    userRepo.adminProfile(id),
    getCurrentUser(),
  ]);
  if (!profile || !actor) notFound();

  const { user, jobCount, companyLogoUrl, jobs, payments } = profile;
  const name = userDisplayName(user);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="User profile"
        title={name}
        description={
          user.email ? (
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-3.5" />
              {user.email}
            </span>
          ) : (
            "Telegram-only account"
          )
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <UserRowActions userId={user.id} status={user.status} />
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/users">
                <ArrowLeft className="size-3.5" />
                Back to users
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Jobs posted"
          value={String(jobCount)}
          icon={Briefcase}
        />
        <StatCard
          label="Status"
          value={statusLabel(user.status)}
          icon={Shield}
        />
        <StatCard
          label="Joined"
          value={format(user.createdAt, "MMM d, yyyy")}
          hint={formatRelativeTime(user.createdAt)}
          icon={Calendar}
        />
        <StatCard
          label="Payments"
          value={String(payments.length)}
          icon={Receipt}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="size-4" />
              Account details
            </CardTitle>
            <CardDescription>Identity, auth, and moderation state.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AdminUserCell user={user} companyLogoUrl={companyLogoUrl} />

            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <DetailRow label="Email" value={user.email ?? "—"} />
              <DetailRow
                label="Telegram"
                value={
                  user.telegramUsername
                    ? `@${user.telegramUsername}`
                    : user.telegramId != null
                      ? String(user.telegramId)
                      : "—"
                }
              />
              <DetailRow label="Auth provider" value={user.authProvider} />
              <DetailRow label="Source" value={user.source} />
              <DetailRow
                label="Role"
                value={
                  <Badge variant="secondary" className="capitalize">
                    {user.role}
                  </Badge>
                }
              />
              <DetailRow
                label="Status"
                value={
                  <Badge
                    variant={
                      user.status === "active"
                        ? "success"
                        : user.status === "banned"
                          ? "destructive"
                          : "warning"
                    }
                    className="capitalize"
                  >
                    {user.status}
                  </Badge>
                }
              />
              <DetailRow
                label="Member verified"
                value={user.telegramVerifiedMembership ? "Yes" : "No"}
              />
              <DetailRow
                label="Joined"
                value={`${format(user.createdAt, "PPpp")} (${formatRelativeTime(user.createdAt)})`}
              />
            </dl>

            {user.status === "banned" && user.banReason && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <p className="font-medium text-destructive">Ban reason</p>
                <p className="mt-1 text-muted-foreground">{user.banReason}</p>
              </div>
            )}

            <UpdateUserRoleForm
              userId={user.id}
              currentRole={user.role}
              actorId={actor.id}
              actorRole={actor.role}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="size-4" />
                Job postings
              </CardTitle>
              <CardDescription>
                {jobCount === 0
                  ? "This user has not submitted any jobs yet."
                  : `${jobCount} total submission${jobCount === 1 ? "" : "s"}.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {jobs.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">No jobs yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map(({ job }) => (
                      <TableRow key={job.id}>
                        <TableCell className="max-w-[200px] truncate font-medium">
                          {job.title}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate">
                          {job.company}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {statusLabel(job.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatRelativeTime(job.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="ghost">
                            <Link href={`/admin/jobs/${job.id}`}>Review</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="size-4" />
                Payment history
              </CardTitle>
              <CardDescription>
                All payment records linked to this account.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {payments.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                  No payments on file.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Job</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map(({ payment: p, job }) => (
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
                        <TableCell className="max-w-[160px] truncate">
                          {job?.title ?? "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatRelativeTime(p.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {job ? (
                            <Button asChild size="sm" variant="ghost">
                              <Link href={`/admin/jobs/${job.id}`}>Open</Link>
                            </Button>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {(user.telegramUsername || user.authProvider === "telegram") && (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex items-start gap-3 p-4 text-sm">
            <Send className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-muted-foreground">
              {user.telegramUsername ? (
                <>
                  Telegram handle{" "}
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    <AtSign className="size-3.5" />
                    {user.telegramUsername}
                  </span>
                  {user.telegramVerifiedMembership
                    ? " · channel membership verified"
                    : " · membership not verified"}
                </>
              ) : (
                "Signed up via Telegram bot."
              )}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-medium">{value}</dd>
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
      return "destructive";
    default:
      return "secondary";
  }
}
