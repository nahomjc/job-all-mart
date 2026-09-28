import { Link } from "@/i18n/routing";
import { redirectTo } from "@/i18n/redirect";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Receipt,
  Send,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { jobRepo } from "@/server/repositories/job";
import { paymentRepo } from "@/server/repositories/payment";
import { env } from "@/lib/env";
import {
  formatLocation,
  formatRelativeTime,
  formatSalary,
  statusLabel,
} from "@/lib/format";
import { paymentMethodLabel } from "@/lib/payment-methods";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const data = await jobRepo.byId(id);
  return {
    title: data ? data.title : "My job",
  };
}

export default async function MyJobDetailPage(props: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = (await props.params) as {
    id: string;
    locale: "en" | "am";
  };
  const isAm = locale === "am";
  const user = await requireUser();
  const data = await jobRepo.byIdWithRelations(id);
  if (!data?.job) notFound();
  if (data.job.userId !== user.id) {
    return await redirectTo("/dashboard/jobs");
  }
  const payment = await paymentRepo.byJobId(id);

  const { job, category } = data;
  const publicUrl = `${env.NEXT_PUBLIC_APP_URL}/jobs/${job.slug}`;
  const needsPayment =
    !payment ||
    job.status === "pending_payment" ||
    payment.status === "rejected";
  const isPosted = job.status === "posted";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={isAm ? "የኔ የስራ ማስታወቂያ" : "My post"}
        title={job.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="size-3.5" />
              {job.company}
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span>{category?.name ?? (isAm ? "ያልተመደበ" : "Uncategorized")}</span>
          </span>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {isPosted && (
              <Button asChild variant="outline" size="sm">
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  {isAm ? "ቀጥታ ማስታወቂያውን ይመልከቱ" : "View live post"}
                </a>
              </Button>
            )}
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/jobs">
                <ArrowLeft className="size-3.5" />
                {isAm ? "ወደ ስራዎቼ ተመለስ" : "Back to my jobs"}
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SnapshotTile
          label={isAm ? "ሁኔታ" : "Status"}
          value={statusLabel(job.status, locale)}
          badgeVariant={statusBadgeVariant(job.status)}
        />
        <SnapshotTile
          label={isAm ? "ክፍያ" : "Payment"}
          value={
            payment
              ? statusLabel(payment.status, locale)
              : isAm
                ? "አልተሰቀለም"
                : "Not uploaded"
          }
          badgeVariant={
            payment ? paymentBadgeVariant(payment.status) : "outline"
          }
        />
        <SnapshotTile
          label={isAm ? "የቀረበበት" : "Submitted"}
          value={formatRelativeTime(job.createdAt, locale)}
          badgeVariant="outline"
        />
        <SnapshotTile
          label={isAm ? "ምንጭ" : "Source"}
          value={job.source === "telegram" ? "Telegram" : isAm ? "ድረ-ገጽ" : "Website"}
          badgeVariant="outline"
        />
      </div>

      <StatusBanner job={job} payment={payment} isAm={isAm} />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg">
                {isAm ? "የስራው ዝርዝር መረጃ" : "Job details"}
              </CardTitle>
              <CardDescription>
                {isAm
                  ? "ለግምገማ እና ለማጽደቅ ያቀረቡት መረጃ።"
                  : "What you submitted for review and publishing."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={Briefcase}
                  label={isAm ? "የስራ አይነት" : "Employment type"}
                  value={statusLabel(job.employmentType, locale)}
                />
                <DetailItem
                  icon={MapPin}
                  label={isAm ? "የስራ ቦታ" : "Location"}
                  value={formatLocation(job.location, locale)}
                />
                <DetailItem
                  label={isAm ? "ደመወዝ" : "Salary"}
                  value={formatSalary(
                    job.salaryMin,
                    job.salaryMax,
                    job.salaryCurrency,
                    { locale },
                  )}
                />
                {job.postedAt && (
                  <DetailItem
                    icon={Calendar}
                    label={isAm ? "የተለጠፈበት" : "Posted"}
                    value={formatRelativeTime(job.postedAt, locale)}
                  />
                )}
                {job.applyUrl && (
                  <DetailItem
                    label={isAm ? "የማመልከቻ ሊንክ" : "Apply link"}
                    value={
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full items-center gap-1 text-primary hover:underline"
                      >
                        <span className="truncate">{job.applyUrl}</span>
                        <ExternalLink className="size-3 shrink-0" />
                      </a>
                    }
                    className="sm:col-span-2"
                  />
                )}
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {isAm ? "ዝርዝር ማብራሪያ" : "Description"}
                </p>
                <div className="mt-3 rounded-xl border bg-muted/20 p-4 text-sm leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          {needsPayment && (
            <Card className="border-primary/25 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="size-4 text-primary" />
                  {isAm ? "ክፍያ ማጠናቀቅ ያስፈልጋል" : "Action required"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {payment?.status === "rejected"
                    ? isAm
                      ? "ክፍያዎ ውድቅ ተደርጓል። እባክዎ አዲስ የደረሰኝ ስክሪንሾት ይስቀሉ።"
                      : "Your payment was rejected. Upload a new screenshot to continue."
                    : isAm
                      ? "ስራዎ ተገምግሞ እንዲጸድቅ የክፍያ ማስረጃ ይስቀሉ።"
                      : "Upload payment proof so our team can review and publish your job."}
                </p>
                <Button asChild className="w-full">
                  <Link href={`/dashboard/jobs/${job.id}/payment`}>
                    {payment
                      ? isAm
                        ? "ክፍያውን በድጋሚ ይስቀሉ"
                        : "Re-upload payment"
                      : isAm
                        ? "የክፍያ ማስረጃ ይስቀሉ"
                        : "Upload payment proof"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <SidebarCard title={isAm ? "የክፍያ መረጃ" : "Payment"} icon={Receipt}>
            {payment ? (
              <div className="space-y-4">
                <dl className="space-y-2 text-sm">
                  <SidebarRow
                    label={isAm ? "የገንዘብ መጠን" : "Amount"}
                    value={`${payment.amount} ${payment.currency}`}
                  />
                  <SidebarRow
                    label={isAm ? "የክፍያ ዘዴ" : "Method"}
                    value={paymentMethodLabel(payment.method, locale)}
                  />
                  <SidebarRow
                    label={isAm ? "የክፍያ ሁኔታ" : "Status"}
                    value={
                      <Badge variant={paymentBadgeVariant(payment.status)}>
                        {statusLabel(payment.status, locale)}
                      </Badge>
                    }
                  />
                  {payment.referenceCode && (
                    <SidebarRow
                      label={isAm ? "የግብይት ቁጥር (Reference)" : "Reference"}
                      value={
                        <span className="font-mono text-xs">
                          {payment.referenceCode}
                        </span>
                      }
                    />
                  )}
                  {payment.accountSuffix && (
                    <SidebarRow
                      label={isAm ? "የሂሳብ ቁጥር መጨረሻ" : "Account suffix"}
                      value={
                        <span className="font-mono text-xs">
                          {payment.accountSuffix}
                        </span>
                      }
                    />
                  )}
                  {payment.phoneNumber && (
                    <SidebarRow
                      label={isAm ? "ስልክ ቁጥር" : "Phone"}
                      value={payment.phoneNumber}
                    />
                  )}
                </dl>
                {payment.screenshotUrl ? (
                  <a
                    href={payment.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block overflow-hidden rounded-xl border bg-muted/30"
                  >
                    <Image
                      src={payment.screenshotUrl}
                      alt={isAm ? "የክፍያ ደረሰኝ ስክሪንሾት" : "Payment screenshot"}
                      width={640}
                      height={480}
                      className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]"
                      unoptimized
                    />
                    <p className="border-t bg-background/80 px-3 py-2 text-center text-xs text-muted-foreground">
                      {isAm ? "ሙሉውን ስክሪንሾት ይመልከቱ" : "View full screenshot"}
                    </p>
                  </a>
                ) : (
                  <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    {isAm ? "ምንም ስክሪንሾት አልተያያዘም።" : "No screenshot on file."}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isAm ? "ምንም የክፍያ መረጃ አልቀረበም።" : "No payment uploaded yet."}
              </p>
            )}
          </SidebarCard>

          <SidebarCard
            title={isAm ? "ቀጣይ ደረጃዎች" : "What happens next"}
            icon={Send}
          >
            <ol className="space-y-3 text-sm">
              <TimelineStep
                done={Boolean(payment)}
                label={
                  isAm
                    ? "የክፍያ ማስረጃ ቀርቧል"
                    : "Payment proof submitted"
                }
              />
              <TimelineStep
                done={
                  payment?.status === "verified" ||
                  ["pending_review", "approved", "scheduled", "posted"].includes(
                    job.status,
                  )
                }
                label={
                  isAm
                    ? "አስተዳዳሪ ክፍያውን ያረጋግጣል"
                    : "Admin verifies payment"
                }
              />
              <TimelineStep
                done={["approved", "scheduled", "posted"].includes(job.status)}
                label={isAm ? "ስራው ጸድቋል" : "Job approved"}
              />
              <TimelineStep
                done={isPosted}
                label={
                  isAm
                    ? "በቴሌግራም እና በድረ-ገጽ ይለጠፋል"
                    : "Published to Telegram & site"
                }
              />
            </ol>
          </SidebarCard>
        </aside>
      </div>
    </div>
  );
}

function StatusBanner({
  job,
  payment,
  isAm,
}: {
  job: { status: string; rejectionReason: string | null };
  payment: { status: string } | null | undefined;
  isAm?: boolean;
}) {
  if (job.status === "rejected" && job.rejectionReason) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
        <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div>
          <p className="font-semibold text-destructive">
            {isAm ? "ማመልከቻው ውድቅ ተደርጓል" : "Submission rejected"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{job.rejectionReason}</p>
        </div>
      </div>
    );
  }

  if (job.status === "pending_review") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <Clock className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="font-semibold text-amber-800 dark:text-amber-300">
            {isAm ? "በአስተዳዳሪ ግምገማ ላይ ይገኛል" : "Under admin review"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAm
              ? `የስራ ማስታወቂያዎን${payment?.status === "pending" ? " እና የክፍያ ማስረጃዎን" : ""} እየገመገምን ነው። እንደጸደቀ ወይም ማስተካከያ ካስፈለገ በቴሌግራም ማሳወቂያ ይደርስዎታል።`
              : `We're reviewing your job${payment?.status === "pending" ? " and payment proof" : ""}. You'll get a Telegram notification when it's approved or if changes are needed.`}
          </p>
        </div>
      </div>
    );
  }

  if (job.status === "posted") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="font-semibold text-amber-800 dark:text-amber-300">
            {isAm ? "የስራ ማስታወቂያዎ በቀጥታ ተለጥፏል" : "Your job is live"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAm
              ? "ይህ የስራ ማስታወቂያ በቴሌግራም ቻናላችን እና በድረ-ገጻችን ላይ በቀጥታ ተለጥፏል።"
              : "This post has been published to Telegram and appears on the public job board."}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

function TimelineStep({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          done
            ? "bg-primary text-primary-foreground"
            : "border border-muted-foreground/30 bg-muted text-muted-foreground"
        }`}
      >
        {done ? "✓" : "·"}
      </span>
      <span className={done ? "font-medium" : "text-muted-foreground"}>{label}</span>
    </li>
  );
}

function SnapshotTile({
  label,
  value,
  badgeVariant,
}: {
  label: string;
  value: string;
  badgeVariant:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "destructive"
    | "outline";
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-2">
        <Badge variant={badgeVariant} className="text-sm font-semibold">
          {value}
        </Badge>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </p>
      <div className="mt-1.5 text-sm font-medium">{value}</div>
    </div>
  );
}

function SidebarCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

function SidebarRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function statusBadgeVariant(
  status: string,
): "default" | "secondary" | "success" | "warning" | "destructive" | "outline" {
  switch (status) {
    case "posted":
      return "success";
    case "approved":
    case "scheduled":
      return "secondary";
    case "pending_payment":
    case "pending_review":
      return "warning";
    case "rejected":
    case "expired":
      return "destructive";
    default:
      return "outline";
  }
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
