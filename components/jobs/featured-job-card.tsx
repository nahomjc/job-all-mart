import { Link } from "@/i18n/routing";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import type { Category, Job } from "@/server/db/schema";
import { formatRelativeTime, statusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

interface FeaturedJobCardProps {
	job: Job;
	category?: Category | null;
	className?: string;
}

function compactSalary(
	min: number | null | undefined,
	max: number | null | undefined,
	currency?: string | null,
): string | null {
	const value = max || min;
	if (!value) return null;

	const code = (currency?.trim() || "USD").toUpperCase();
	const absolute = Math.abs(value);
	let amount: string;

	if (absolute >= 1_000_000) {
		amount = `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
	} else if (absolute >= 1_000) {
		amount = `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
	} else {
		amount = value.toLocaleString();
	}

	const symbol =
		code === "USD" ? "$" : code === "ETB" ? "Br " : `${code} `;

	return `${symbol}${amount}/yr`;
}

function plainDescription(raw: string): string {
	return raw
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

export function FeaturedJobCard({
	job,
	category,
	className,
}: FeaturedJobCardProps) {
	const href = `/jobs/${job.slug}`;
	const salary = compactSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
	const employment = statusLabel(job.employmentType);
	const initial = job.company.trim().charAt(0).toUpperCase() || "·";
	const description = plainDescription(job.description);
	const posted = job.postedAt
		? formatRelativeTime(job.postedAt)
		: "Just posted";

	return (
		<article
			className={cn(
				"group relative flex h-full min-h-[280px] flex-col rounded-2xl border border-border/80 bg-card transition-colors hover:border-primary/40 hover:bg-muted/20 sm:min-h-[300px]",
				className,
			)}
		>
			<Link
				href={href}
				className="absolute inset-0 z-10 rounded-2xl"
				aria-label={`View ${job.title} at ${job.company}`}
			/>

			<div className="flex flex-1 flex-col p-6 sm:p-7">
				<div className="flex items-center gap-3.5">
					<div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/40">
						{job.logoUrl ? (
							<Image
								src={job.logoUrl}
								alt=""
								width={48}
								height={48}
								className="size-full object-cover"
							/>
						) : (
							<span className="text-base font-semibold tracking-tight text-foreground/70">
								{initial}
							</span>
						)}
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate text-[15px] font-medium text-foreground">
							{job.company}
						</p>
						{category ? (
							<p className="truncate text-sm text-muted-foreground">
								{category.name}
							</p>
						) : null}
					</div>
				</div>

				<h3 className="mt-5 line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-lg">
					{job.title}
				</h3>

				{description ? (
					<p className="mt-2.5 line-clamp-3 break-words text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
						{description}
					</p>
				) : null}

				<div className="mt-4 flex flex-wrap gap-2">
					<span className="inline-flex items-center rounded-md border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
						{employment}
					</span>
					{salary ? (
						<span className="inline-flex items-center rounded-md border border-border/70 bg-muted/40 px-2.5 py-1 text-xs font-medium tabular-nums text-muted-foreground">
							{salary}
						</span>
					) : null}
				</div>

				<div className="mt-auto pt-5">
					<div className="flex items-center gap-3 border-t border-border/60 pt-4 text-sm text-muted-foreground">
						<span className="inline-flex min-w-0 items-center gap-1.5">
							<MapPin className="size-3.5 shrink-0 opacity-70" />
							<span className="truncate">{job.location}</span>
						</span>
						<span className="ml-auto shrink-0 tabular-nums">{posted}</span>
					</div>
					<div
						className="pointer-events-none mt-4 inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors group-hover:border-primary/40 group-hover:bg-accent group-hover:text-accent-foreground"
						aria-hidden
					>
						View details
						<ArrowRight className="size-3.5" />
					</div>
				</div>
			</div>
		</article>
	);
}
