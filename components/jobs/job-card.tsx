import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Briefcase, Clock } from "lucide-react";
import type { Category, Job } from "@/server/db/schema";
import { Badge } from "@/components/ui/badge";
import {
	formatLocation,
	formatRelativeTime,
	formatSalary,
	statusLabel,
} from "@/lib/format";
import { cn } from "@/lib/utils";

interface JobCardProps {
	job: Job;
	category?: Category | null;
	className?: string;
}

export function JobCard({ job, category, className }: JobCardProps) {
	const locale = useLocale() as "en" | "am";
	const t = useTranslations("jobs");
	const href = `/jobs/${job.slug}`;
	const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, {
		locale,
	});
	const hasSalary = Boolean(job.salaryMin || job.salaryMax);
	const posted = job.postedAt
		? formatRelativeTime(job.postedAt, locale)
		: t("justPosted");
	const displayLocation = formatLocation(job.location, locale);
	const employment = statusLabel(job.employmentType, locale);

	return (
		<article
			className={cn(
				"group relative rounded-2xl border border-border/70 bg-card transition-colors hover:border-primary/35 hover:bg-muted/20",
				className,
			)}
		>
			<Link
				href={href}
				className="absolute inset-0 z-10 rounded-2xl"
				aria-label={`${job.title} - ${job.company}`}
			/>

			<div className="flex gap-4 p-5 sm:gap-5 sm:p-6">
				<div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/40 sm:size-14">
					{job.logoUrl ? (
						<Image
							src={job.logoUrl}
							alt=""
							width={56}
							height={56}
							className="size-full object-cover"
						/>
					) : (
						<span className="flex size-full items-center justify-center bg-primary/5 text-sm font-semibold tracking-tight text-primary">
							{job.company.trim().charAt(0).toUpperCase() || "·"}
						</span>
					)}
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
						<div className="min-w-0 space-y-1">
							<div className="flex flex-wrap items-center gap-2">
								<h3 className="truncate text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-[1.05rem]">
									{job.title}
								</h3>
								{job.isFeatured ? (
									<Badge
										variant="warning"
										className="pointer-events-none h-5 shrink-0 px-1.5 text-[10px] font-medium uppercase tracking-wide"
									>
										{t("featured")}
									</Badge>
								) : null}
							</div>
							<p className="truncate text-sm text-muted-foreground">
								{job.company}
								{category ? (
									<>
										<span className="mx-1.5 text-border">·</span>
										<span>{category.name}</span>
									</>
								) : null}
							</p>
						</div>

						{hasSalary ? (
							<p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
								{salary}
							</p>
						) : null}
					</div>

					<div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground sm:mt-3.5 sm:text-[13px]">
						<span className="inline-flex items-center gap-1.5">
							<MapPin className="size-3.5 shrink-0 opacity-70" />
							<span className="truncate">{displayLocation}</span>
						</span>
						<span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
						<span className="inline-flex items-center gap-1.5">
							<Briefcase className="size-3.5 shrink-0 opacity-70" />
							{employment}
						</span>
						<span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
						<span className="inline-flex items-center gap-1.5">
							<Clock className="size-3.5 shrink-0 opacity-70" />
							{posted}
						</span>
					</div>
				</div>
			</div>
		</article>
	);
}
