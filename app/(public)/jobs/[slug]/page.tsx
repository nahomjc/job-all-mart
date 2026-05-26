import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { jobs, categories, users } from "@/server/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatRelativeTime,
  formatSalary,
  statusLabel,
} from "@/lib/format";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const rows = await db
    .select({ title: jobs.title, description: jobs.description, company: jobs.company })
    .from(jobs)
    .where(eq(jobs.slug, slug))
    .limit(1);
  if (!rows[0]) return { title: "Job not found" };
  return {
    title: `${rows[0].title} at ${rows[0].company}`,
    description: rows[0].description.slice(0, 160),
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const rows = await db
    .select({
      job: jobs,
      category: categories,
      employer: users,
    })
    .from(jobs)
    .leftJoin(categories, eq(categories.id, jobs.categoryId))
    .leftJoin(users, eq(users.id, jobs.userId))
    .where(eq(jobs.slug, slug))
    .limit(1);

  const data = rows[0];
  if (!data || data.job.status !== "posted") notFound();
  const { job, category, employer } = data;

  return (
    <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[1fr_280px]">
      <article>
        <div className="mb-6 flex items-start gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
            {job.logoUrl ? (
              <Image
                src={job.logoUrl}
                alt={job.company}
                width={64}
                height={64}
                className="size-full rounded-xl object-cover"
              />
            ) : (
              <Building2 className="size-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <p className="mt-1 text-lg text-muted-foreground">{job.company}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {category && <Badge variant="secondary">{category.name}</Badge>}
              <Badge variant="outline">{statusLabel(job.employmentType)}</Badge>
              {job.isFeatured && <Badge variant="warning">Featured</Badge>}
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-3 text-lg font-semibold">About this role</h2>
            <div className="prose prose-sm max-w-none whitespace-pre-line text-foreground dark:prose-invert">
              {job.description}
            </div>
          </CardContent>
        </Card>

        {job.contactInfo && (
          <Card className="mt-4">
            <CardContent className="p-6">
              <h2 className="mb-2 text-lg font-semibold">How to apply</h2>
              <p className="whitespace-pre-line text-sm">{job.contactInfo}</p>
            </CardContent>
          </Card>
        )}
      </article>

      <aside className="space-y-4">
        <Card>
          <CardContent className="space-y-3 p-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="size-4" />
              <span>{statusLabel(job.employmentType)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="size-4" />
              <span>
                {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-4" />
              <span>
                Posted{" "}
                {job.postedAt ? formatRelativeTime(job.postedAt) : "recently"}
              </span>
            </div>
          </CardContent>
        </Card>

        {job.applyUrl && (
          <Button asChild className="w-full" size="lg">
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
              Apply now <ExternalLink className="size-4" />
            </a>
          </Button>
        )}

        {employer?.telegramUsername && (
          <Card>
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Posted by
              </p>
              <p className="mt-1 font-medium">
                @{employer.telegramUsername}
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                <a
                  href={`https://t.me/${employer.telegramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Message on Telegram
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        <Button asChild variant="ghost" className="w-full">
          <Link href="/jobs">← Back to all jobs</Link>
        </Button>
      </aside>
    </div>
  );
}
