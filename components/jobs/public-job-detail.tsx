import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
	ArrowLeft,
	BadgeCheck,
	Briefcase,
	Calendar,
	ChevronRight,
	ExternalLink,
	MapPin,
	MessageCircle,
	Send,
	Shield,
	Sparkles,
	Wallet,
} from "lucide-react";
import {
	formatRelativeTime,
	formatSalary,
	statusLabel,
} from "@/lib/format";
import { userDisplayName } from "@/lib/user-display";
import type { Category, Job, User } from "@/server/db/schema";
import { cn } from "@/lib/utils";

export interface PublicJobDetailProps {
	job: Job;
	category: Category | null;
	employer: User | null;
}

export function PublicJobDetail({
	job,
	category,
	employer,
}: PublicJobDetailProps) {
	const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
	const hasSalary = Boolean(job.salaryMin || job.salaryMax);
	const postedLabel = job.postedAt
		? formatRelativeTime(job.postedAt)
		: "Recently";

	const tags = [
		category?.name,
		statusLabel(job.employmentType),
		job.location.split(/[,·|/]/)[0]?.trim(),
		job.isFeatured ? "Featured" : null,
	].filter(Boolean) as string[];

	return (
		<div className="min-h-[70vh] shell-canvas pt-24 pb-8 md:pt-28 md:pb-10">
			<div className="container mx-auto space-y-5 px-4">
				<nav
					aria-label="Breadcrumb"
					className="flex flex-wrap items-center gap-1 text-[13px] text-muted-foreground"
				>
					<Link href="/" className="hover:text-primary">
						Home
					</Link>
					<ChevronRight className="size-3.5 shrink-0" aria-hidden />
					<Link href="/jobs" className="hover:text-primary">
						Jobs
					</Link>
					{category ? (
						<>
							<ChevronRight className="size-3.5 shrink-0" aria-hidden />
							<Link
								href={`/jobs?category=${category.slug}`}
								className="hover:text-primary"
							>
								{category.name}
							</Link>
						</>
					) : null}
					<ChevronRight className="size-3.5 shrink-0" aria-hidden />
					<span className="line-clamp-1 font-medium text-foreground">
						{job.title}
					</span>
				</nav>

				<section className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-7">
					<div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_80%_20%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_55%)]" />

					<div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
						<div className="flex min-w-0 items-start gap-4">
							<div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-muted/50 sm:size-[72px]">
								{job.logoUrl ? (
									<Image
										src={job.logoUrl}
										alt=""
										width={72}
										height={72}
										className="size-full object-cover"
									/>
								) : (
									<span className="text-xl font-bold text-primary">
										{job.company.trim().charAt(0).toUpperCase() || "·"}
									</span>
								)}
							</div>

							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
										<Shield className="size-3" />
										Verified listing
									</span>
									{job.isFeatured ? (
										<span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
											<Sparkles className="size-3" />
											Featured
										</span>
									) : null}
								</div>

								<h1 className="mt-2.5 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
									{job.title}
								</h1>

								<p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[15px] text-muted-foreground">
									<span className="font-medium text-foreground/80">
										{job.company}
									</span>
									<BadgeCheck
										className="size-4 text-primary"
										aria-label="Verified employer"
									/>
								</p>

								{tags.length > 0 ? (
									<ul className="mt-3.5 flex flex-wrap gap-1.5">
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
							</div>
						</div>

						<div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col lg:items-stretch">
							{job.applyUrl ? (
								<a
									href={job.applyUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
								>
									Apply now
									<ExternalLink className="size-4" />
								</a>
							) : null}
							<Link
								href="/jobs"
								className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-medium text-foreground/80 transition hover:bg-muted"
							>
								<ArrowLeft className="size-3.5" />
								All jobs
							</Link>
						</div>
					</div>

					<div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						<QuickFact icon={MapPin} label="Location" value={job.location} />
						<QuickFact
							icon={Briefcase}
							label="Employment"
							value={statusLabel(job.employmentType)}
						/>
						<QuickFact
							icon={Wallet}
							label="Salary"
							value={hasSalary ? salary : "Not specified"}
						/>
						<QuickFact icon={Calendar} label="Posted" value={postedLabel} />
					</div>
				</section>

				<div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
					<div className="space-y-5">
						<section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-7">
							<h2 className="text-lg font-bold tracking-tight text-foreground">
								About this role
							</h2>
							<p className="mt-1 text-[13px] text-muted-foreground">
								Full description as published on our board and Telegram channels.
							</p>
							<div className="mt-5 rounded-xl border border-border/60 bg-muted/40 p-5 text-[14px] leading-relaxed whitespace-pre-line text-foreground/85 sm:text-[15px]">
								{job.description}
							</div>
						</section>

						{(job.contactInfo || job.applyUrl) && (
							<section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-7">
								<div className="flex items-center gap-2.5">
									<span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
										<Send className="size-4" />
									</span>
									<div>
										<h2 className="text-lg font-bold tracking-tight text-foreground">
											How to apply
										</h2>
										<p className="text-[13px] text-muted-foreground">
											Follow the instructions below to reach the employer.
										</p>
									</div>
								</div>

								{job.contactInfo ? (
									<div className="mt-5 rounded-xl border border-border/60 bg-muted/40 p-4 text-[14px] leading-relaxed whitespace-pre-line text-foreground/85">
										{job.contactInfo}
									</div>
								) : null}

								{job.applyUrl ? (
									<a
										href={job.applyUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
									>
										Open application link
										<ExternalLink className="size-4" />
									</a>
								) : null}
							</section>
						)}
					</div>

					<aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
						{job.applyUrl ? (
							<div className="rounded-2xl border border-primary/25 bg-primary/10 p-5 shadow-sm">
								<h3 className="text-[15px] font-bold text-foreground">
									Ready to apply?
								</h3>
								<p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
									You will leave this site and continue on the employer&apos;s
									page.
								</p>
								<a
									href={job.applyUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
								>
									Apply on company site
									<ExternalLink className="size-4" />
								</a>
							</div>
						) : null}

						<Panel title="At a glance" icon={Briefcase}>
							<dl className="space-y-3 text-[13px]">
								<Row label="Company" value={job.company} />
								<Row label="Location" value={job.location} />
								<Row
									label="Type"
									value={statusLabel(job.employmentType)}
								/>
								<Row
									label="Salary"
									value={hasSalary ? salary : "Not specified"}
								/>
								<Row label="Posted" value={postedLabel} />
								{category ? (
									<Row
										label="Category"
										value={
											<Link
												href={`/jobs?category=${category.slug}`}
												className="font-medium text-primary hover:underline"
											>
												{category.name}
											</Link>
										}
									/>
								) : null}
							</dl>
						</Panel>

						{employer &&
						(employer.telegramUsername || employer.displayName) ? (
							<Panel title="Posted by" icon={MessageCircle}>
								<p className="text-[14px] font-semibold text-foreground">
									{userDisplayName(employer)}
								</p>
								{employer.telegramUsername ? (
									<a
										href={`https://t.me/${employer.telegramUsername}`}
										target="_blank"
										rel="noopener noreferrer"
										className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground/80 transition hover:bg-muted"
									>
										Message on Telegram
										<ExternalLink className="size-3.5" />
									</a>
								) : null}
							</Panel>
						) : null}

						<div className="rounded-2xl border border-dashed border-border bg-card px-4 py-3.5 text-center text-[12px] leading-relaxed text-muted-foreground">
							Listings are payment-verified and reviewed by our team before they
							go live.
						</div>
					</aside>
				</div>
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
		<div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 p-3.5">
			<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
				<Icon className="size-4" />
			</span>
			<div className="min-w-0">
				<p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
					{label}
				</p>
				<p className="mt-0.5 truncate text-[13px] font-semibold text-foreground">
					{value}
				</p>
			</div>
		</div>
	);
}

function Panel({
	title,
	icon: Icon,
	children,
}: {
	title: string;
	icon: LucideIcon;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
			<div className="mb-4 flex items-center gap-2.5">
				<span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<Icon className="size-4" />
				</span>
				<h3 className="text-[15px] font-bold text-foreground">{title}</h3>
			</div>
			{children}
		</div>
	);
}

function Row({
	label,
	value,
}: {
	label: string;
	value: React.ReactNode;
}) {
	return (
		<div className="flex items-start justify-between gap-3">
			<dt className="text-muted-foreground">{label}</dt>
			<dd
				className={cn(
					"max-w-[60%] text-right font-medium text-foreground",
					typeof value !== "string" && "max-w-[60%]",
				)}
			>
				{value}
			</dd>
		</div>
	);
}
