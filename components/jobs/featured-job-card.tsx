import Link from "next/link";
import Image from "next/image";
import type { Category, Job } from "@/server/db/schema";
import { statusLabel } from "@/lib/format";
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
): { amount: string; period: string } | null {
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

	return {
		amount: `${symbol}${amount}`,
		period: "/year",
	};
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

	return (
		<Link
			href={href}
			aria-label={`View ${job.title} at ${job.company}`}
			className={cn(
				"group relative flex h-full min-h-[400px] flex-col overflow-hidden rounded-[1.75rem] bg-white p-6 text-zinc-900 shadow-[0_20px_50px_-24px_rgba(15,40,80,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-28px_rgba(15,40,80,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-[420px] sm:p-7 xl:min-h-[440px]",
				className,
			)}
		>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-70"
				style={{
					backgroundImage: `
						linear-gradient(135deg, color-mix(in oklch, var(--primary) 8%, white) 25%, transparent 25%),
						linear-gradient(225deg, color-mix(in oklch, var(--primary) 6%, white) 25%, transparent 25%),
						linear-gradient(45deg, color-mix(in oklch, var(--primary) 10%, white) 25%, transparent 25%),
						linear-gradient(315deg, color-mix(in oklch, var(--primary) 4%, white) 25%, white 25%)
					`,
					backgroundPosition: "0 0, 28px 0, 28px -28px, 0 28px",
					backgroundSize: "56px 56px",
				}}
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/95 via-white/70 to-primary/5"
			/>

			<div className="relative flex flex-1 flex-col">
				<div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-deep text-white shadow-lg shadow-brand-deep/30 ring-4 ring-white">
					{job.logoUrl ? (
						<Image
							src={job.logoUrl}
							alt=""
							width={56}
							height={56}
							className="size-full object-cover"
						/>
					) : (
						<span className="text-lg font-semibold tracking-tight">
							{initial}
						</span>
					)}
				</div>

				<div className="mt-8 space-y-3.5">
					<p className="text-sm font-medium text-zinc-500">
						{job.company}
						{category ? (
							<span className="text-zinc-400"> · {category.name}</span>
						) : null}
					</p>
					<h3 className="text-balance text-[1.55rem] font-extrabold uppercase leading-[1.08] tracking-tight text-zinc-900 sm:text-[1.7rem] xl:text-[1.85rem]">
						{job.title}
					</h3>
					<span className="inline-flex rounded-full bg-brand-deep px-3 py-1 text-[11px] font-semibold tracking-wide text-white">
						{employment}
					</span>
				</div>

				<div className="mt-auto flex flex-col gap-5 pt-8">
					<div className="min-w-0">
						<p className="truncate text-sm font-medium text-zinc-500">
							{job.location}
						</p>
						{salary ? (
							<p className="mt-1.5 flex items-baseline gap-1">
								<span className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-[1.85rem]">
									{salary.amount}
								</span>
								<span className="text-sm italic text-zinc-500">
									{salary.period}
								</span>
							</p>
						) : (
							<p className="mt-1.5 text-sm font-medium text-zinc-500">
								Salary negotiable
							</p>
						)}
					</div>

					<span className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_-10px_rgba(37,99,235,0.65)] transition group-hover:bg-brand-deep">
						Apply now
					</span>
				</div>
			</div>
		</Link>
	);
}
