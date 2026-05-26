import Link from "next/link";
import Image from "next/image";
import { MapPin, Briefcase, Building2 } from "lucide-react";
import type { Category, Job } from "@/server/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, formatSalary, statusLabel, truncate } from "@/lib/format";

interface JobCardProps {
  job: Job;
  category?: Category | null;
}

export function JobCard({ job, category }: JobCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:border-primary/60 hover:shadow-md">
      {job.isFeatured && (
        <div className="absolute right-3 top-3">
          <Badge variant="warning">Featured</Badge>
        </div>
      )}
      <CardContent className="flex gap-4 p-5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
          {job.logoUrl ? (
            <Image
              src={job.logoUrl}
              alt={job.company}
              width={48}
              height={48}
              className="size-full rounded-lg object-cover"
            />
          ) : (
            <Building2 className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/jobs/${job.slug}`}
            className="line-clamp-1 font-semibold leading-tight hover:text-primary"
          >
            {job.title}
          </Link>
          <p className="mt-0.5 text-sm text-muted-foreground">{job.company}</p>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {truncate(job.description.replace(/\s+/g, " "), 140)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Briefcase className="size-3.5" />
              {statusLabel(job.employmentType)}
            </span>
            {category && (
              <Badge variant="secondary" className="font-normal">
                {category.name}
              </Badge>
            )}
            <span className="ml-auto">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)} ·{" "}
              {job.postedAt ? formatRelativeTime(job.postedAt) : "Just posted"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
