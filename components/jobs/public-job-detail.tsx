import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  MapPin,
  MessageCircle,
  Send,
  Shield,
  Wallet,
} from "lucide-react";
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
  formatRelativeTime,
  formatSalary,
  statusLabel,
} from "@/lib/format";
import { userDisplayName } from "@/lib/user-display";
import type { Category, Job, User } from "@/server/db/schema";

export interface PublicJobDetailProps {
  job: Job;
  category: Category | null;
  employer: User | null;
}

export function PublicJobDetail({ job, category, employer }: PublicJobDetailProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
  const postedLabel = job.postedAt
    ? formatRelativeTime(job.postedAt)
    : "Recently";

  return (
    <div className="min-h-full">
      <div className="border-b bg-gradient-to-b from-primary/8 via-primary/3 to-background">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
          >
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="size-3.5 shrink-0" aria-hidden />
            <Link href="/jobs" className="hover:text-foreground">
              Jobs
            </Link>
            {category && (
              <>
                <ChevronRight className="size-3.5 shrink-0" aria-hidden />
                <Link
                  href={`/jobs?category=${category.slug}`}
                  className="hover:text-foreground"
                >
                  {category.name}
                </Link>
              </>
            )}
            <ChevronRight className="size-3.5 shrink-0" aria-hidden />
            <span className="line-clamp-1 font-medium text-foreground">
              {job.title}
            </span>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4 md:gap-5">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border bg-background shadow-sm md:size-20">
                {job.logoUrl ? (
                  <Image
                    src={job.logoUrl}
                    alt={job.company}
                    width={80}
                    height={80}
                    className="size-full rounded-2xl object-cover"
                  />
                ) : (
                  <Building2 className="size-9 text-muted-foreground md:size-10" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                  >
                    <Shield className="size-3" />
                    Verified listing
                  </Badge>
                  {job.isFeatured && (
                    <Badge variant="warning">Featured</Badge>
                  )}
                </div>
                <h1 className="mt-3 text-balance text-2xl font-bold tracking-tight md:text-4xl">
                  {job.title}
                </h1>
                <p className="mt-2 text-lg font-medium text-muted-foreground md:text-xl">
                  {job.company}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {category && (
                    <Badge variant="secondary">{category.name}</Badge>
                  )}
                  <Badge variant="outline">
                    {statusLabel(job.employmentType)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-end">
              {job.applyUrl && (
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apply now
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              )}
              <Button asChild variant="outline" size="sm">
                <Link href="/jobs">
                  <ArrowLeft className="size-3.5" />
                  All jobs
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickFact icon={MapPin} label="Location" value={job.location} />
            <QuickFact
              icon={Briefcase}
              label="Employment"
              value={statusLabel(job.employmentType)}
            />
            <QuickFact icon={Wallet} label="Salary" value={salary} />
            <QuickFact icon={Calendar} label="Posted" value={postedLabel} />
          </div>
        </div>
      </div>

      <div className="container mx-auto grid gap-8 px-4 py-10 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg">About this role</CardTitle>
              <CardDescription>
                Full description as published to our job board and Telegram channels.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="rounded-xl border bg-muted/15 p-5 text-sm leading-relaxed whitespace-pre-line md:text-base">
                {job.description}
              </div>
            </CardContent>
          </Card>

          {(job.contactInfo || job.applyUrl) && (
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Send className="size-5 text-primary" />
                  How to apply
                </CardTitle>
                <CardDescription>
                  Follow the instructions below to reach the employer.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {job.contactInfo && (
                  <div className="rounded-xl border bg-muted/15 p-4 text-sm leading-relaxed whitespace-pre-line">
                    {job.contactInfo}
                  </div>
                )}
                {job.applyUrl && (
                  <Button asChild className="w-full sm:w-auto">
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open application link
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          {job.applyUrl && (
            <Card className="border-primary/25 bg-primary/5 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ready to apply?</CardTitle>
                <CardDescription>
                  You will leave this site and continue on the employer&apos;s page.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild className="w-full" size="lg">
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apply on company site
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          <SidebarCard title="At a glance" icon={CheckCircle2}>
            <dl className="space-y-3 text-sm">
              <SidebarRow label="Company" value={job.company} />
              <SidebarRow label="Location" value={job.location} />
              <SidebarRow
                label="Type"
                value={statusLabel(job.employmentType)}
              />
              <SidebarRow label="Salary" value={salary} />
              <SidebarRow label="Posted" value={postedLabel} />
              {category && (
                <SidebarRow
                  label="Category"
                  value={
                    <Link
                      href={`/jobs?category=${category.slug}`}
                      className="text-primary hover:underline"
                    >
                      {category.name}
                    </Link>
                  }
                />
              )}
            </dl>
          </SidebarCard>

          {employer && (employer.telegramUsername || employer.displayName) && (
            <SidebarCard title="Posted by" icon={MessageCircle}>
              <p className="text-sm font-medium">
                {userDisplayName(employer)}
              </p>
              {employer.telegramUsername && (
                <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                  <a
                    href={`https://t.me/${employer.telegramUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Message on Telegram
                    <ExternalLink className="size-3.5" />
                  </a>
                </Button>
              )}
            </SidebarCard>
          )}

          <Card className="border-dashed bg-muted/20 shadow-none">
            <CardContent className="p-4 text-center text-xs text-muted-foreground">
              Listings are payment-verified and reviewed by our team before they go live.
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function QuickFact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-background/80 p-4 shadow-sm backdrop-blur-sm">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-semibold">{value}</p>
      </div>
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
    <Card className="shadow-sm">
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
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
