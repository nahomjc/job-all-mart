import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Bookmark, Star } from "lucide-react";
import type { Category, Job } from "@/server/db/schema";
import { formatRelativeTime, formatSalary, statusLabel, truncate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface JobsBrowseCardProps {
	job: Job;
	category?: Category | null;
}

function buildTags(job: Job, category?: Category | null): string[] {
	const tags: string[] = [];
	if (category?.name) tags.push(category.name);
	tags.push(statusLabel(job.employmentType));
	if (job.location) {
		const loc = job.location.split(/[,·|/]/)[0]?.trim();
		if (loc && loc.length <= 24) tags.push(loc);
	}
	if (job.isFeatured) tags.push("Featured");
	return tags.slice(0, 4);
}

export function JobsBrowseCard({ job, category }: JobsBrowseCardProps) {
	const href = `/jobs/${job.slug}`;
	const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
	const hasSalary = Boolean(job.salaryMin || job.salaryMax);
	const posted = job.postedAt
		? formatRelativeTime(job.postedAt)
		: "Just posted";
	const tags = buildTags(job, category);
	const description = truncate(job.description.replace(/\s+/g, " ").trim(), 110);

	return (
		<article className="group relative flex h-full flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
			<Link
				href={href}
				className="absolute inset-0 z-10 rounded-2xl"
				aria-label={`View ${job.title} at ${job.company}`}
			/>

			<div className="flex items-start gap-3">
				<div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/50">
					{job.logoUrl ? (
						<Image
							src={job.logoUrl}
							alt=""
							width={48}
							height={48}
							className="size-full object-cover"
						/>
					) : (
						<span className="text-sm font-bold text-primary">
							{job.company.trim().charAt(0).toUpperCase() || "·"}
						</span>
					)}
				</div>

				<div className="min-w-0 flex-1 pt-0.5">
					<h3 className="truncate text-[15px] font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
						{job.title}
					</h3>
					<p className="mt-0.5 flex items-center gap-1 truncate text-[13px] text-muted-foreground">
						<span className="truncate">{job.company}</span>
						<BadgeCheck
							className="size-3.5 shrink-0 text-primary"
							aria-label="Verified employer"
						/>
					</p>
				</div>

				<span
					className="relative z-20 flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
					aria-hidden
				>
					<Bookmark className="size-4" />
				</span>
			</div>

			<p className="mt-3 text-[13px] text-muted-foreground">
				{statusLabel(job.employmentType)}
				{hasSalary ? (
					<>
						{" "}
						- Est. Budget :{" "}
						<span className="font-medium text-foreground/80">{salary}</span>
					</>
				) : null}
			</p>

			<p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground/80">
				{description}
			</p>

			{tags.length > 0 ? (
				<ul className="mt-3 flex flex-wrap gap-1.5">
					{tags.map((tag) => (
						<li
							key={tag}
							className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary"
						>
							{tag}
						</li>
					))}
				</ul>
			) : null}

			<div className="mt-auto flex items-center justify-between gap-3 pt-4">
				<div className="flex items-center gap-0.5" aria-hidden>
					{[0, 1, 2, 3, 4].map((star) => (
						<Star
							key={star}
							className={cn(
								"size-3.5",
								star < (job.isFeatured ? 5 : 4)
									? "fill-amber-400 text-amber-400"
									: "fill-muted text-muted",
							)}
						/>
					))}
				</div>
				<span className="text-[12px] text-muted-foreground">
					Posted {posted.replace(/^about /i, "")}
				</span>
			</div>
		</article>
	);
}
