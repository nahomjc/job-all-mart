import { AdminJobActions } from "@/components/admin/admin-job-actions";
import { AdminJobDetailsPanel } from "@/components/admin/admin-job-details-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatRelativeTime, statusLabel } from "@/lib/format";
import { paymentMethodLabel } from "@/lib/payment-methods";
import { jobRepo } from "@/server/repositories/job";
import { paymentRepo } from "@/server/repositories/payment";
import { telegramPostRepo } from "@/server/repositories/telegramPost";
import type { LucideIcon } from "lucide-react";
import {
	ArrowLeft,
	AtSign,
	Building2,
	Mail,
	Receipt,
	Send,
	Shield,
	User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata(props: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await props.params;
	const data = await jobRepo.byId(id);
	return {
		title: data ? `Review · ${data.title}` : "Review job",
	};
}

export default async function AdminJobReviewPage(props: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await props.params;
	const data = await jobRepo.byIdWithRelations(id);
	if (!data?.job) notFound();
	const { job, category, employer } = data;
	const payment = await paymentRepo.byJobId(id);
	const tgPosts = await telegramPostRepo.byJobId(id);

	return (
		<div className="mx-auto w-full max-w-full min-w-0 space-y-4 overflow-x-hidden sm:space-y-6 md:space-y-8">
			<header className="flex flex-col gap-3 sm:gap-4">
				<div className="flex min-w-0 items-start gap-3 sm:gap-4">
					<div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted/50 sm:size-14 md:size-16">
						{job.logoUrl ? (
							<Image
								src={job.logoUrl}
								alt={job.company}
								width={64}
								height={64}
								className="size-full rounded-xl object-cover"
							/>
						) : (
							<Building2 className="size-6 text-muted-foreground sm:size-7 md:size-8" />
						)}
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-[10px] font-semibold uppercase tracking-wider text-primary sm:text-xs">
							Job review
						</p>
						<h1 className="mt-0.5 break-words text-xl font-bold tracking-tight sm:mt-1 sm:text-2xl md:text-3xl">
							{job.title}
						</h1>
						<p className="mt-1 text-xs text-muted-foreground sm:text-sm">
							<span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
								<span className="inline-flex min-w-0 items-center gap-1.5 font-medium text-foreground">
									<Building2 className="size-3.5 shrink-0" />
									<span className="break-words">{job.company}</span>
								</span>
								<span className="text-muted-foreground/60">·</span>
								<span className="break-words">
									{category?.name ?? "Uncategorized"}
								</span>
							</span>
						</p>
					</div>
				</div>
				<Button
					asChild
					variant="outline"
					className="h-11 w-full shrink-0 sm:w-auto sm:self-end"
				>
					<Link href="/admin/jobs">
						<ArrowLeft className="size-4" />
						Back to queue
					</Link>
				</Button>
			</header>

			<section
				aria-label="Status overview"
				className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4"
			>
				<SnapshotTile
					label="Job status"
					value={statusLabel(job.status)}
					badgeVariant={jobBadgeVariant(job.status)}
				/>
				<SnapshotTile
					label="Payment"
					value={payment ? statusLabel(payment.status) : "None"}
					badgeVariant={
						payment ? paymentBadgeVariant(payment.status) : "outline"
					}
				/>
				<SnapshotTile
					label="Spam score"
					value={String(job.spamScore)}
					badgeVariant={
						job.spamScore >= 50
							? "destructive"
							: job.spamScore >= 20
								? "warning"
								: "secondary"
					}
				/>
				<SnapshotTile
					label="Source"
					value={job.source === "telegram" ? "Telegram" : "Website"}
					badgeVariant="outline"
				/>
			</section>

			<div className="grid min-w-0 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,360px)] xl:items-start">
				<div className="min-w-0 space-y-4 sm:space-y-6">
					<AdminJobActions
						jobId={job.id}
						jobTitle={job.title}
						jobCompany={job.company}
						jobStatus={job.status}
						payment={
							payment
								? {
										id: payment.id,
										status: payment.status,
										amount: payment.amount,
										currency: payment.currency,
										method: payment.method,
										referenceCode: payment.referenceCode,
										accountSuffix: payment.accountSuffix,
										phoneNumber: payment.phoneNumber,
										screenshotUrl: payment.screenshotUrl,
									}
								: null
						}
						jobDetails={
							<AdminJobDetailsPanel
								title={job.title}
								company={job.company}
								categoryName={category?.name ?? "Uncategorized"}
								logoUrl={job.logoUrl}
								employmentType={job.employmentType}
								location={job.location}
								salaryMin={job.salaryMin}
								salaryMax={job.salaryMax}
								salaryCurrency={job.salaryCurrency}
								createdAt={job.createdAt}
								applyUrl={job.applyUrl}
								description={job.description}
							/>
						}
					/>
				</div>

				<aside className="min-w-0 space-y-3 sm:space-y-4 xl:sticky xl:top-20 xl:self-start">
					<SidebarCard title="Employer" icon={User}>
						{employer ? (
							<div className="space-y-3">
								<p className="break-words font-semibold">
									{employer.displayName ?? "Unnamed user"}
								</p>
								{employer.email && (
									<MetaLine icon={Mail} text={employer.email} />
								)}
								{employer.telegramUsername && (
									<MetaLine
										icon={AtSign}
										text={`@${employer.telegramUsername}`}
									/>
								)}
								<Button
									asChild
									variant="outline"
									className="h-11 w-full"
								>
									<Link href={`/admin/users/${employer.id}`}>
										View user profile
									</Link>
								</Button>
							</div>
						) : (
							<p className="text-sm text-muted-foreground">
								No employer linked.
							</p>
						)}
					</SidebarCard>

					<SidebarCard title="Payment proof" icon={Receipt}>
						{payment ? (
							<div className="space-y-4">
								<dl className="space-y-3 text-sm">
									<SidebarRow
										label="Amount"
										value={`${payment.amount} ${payment.currency}`}
									/>
									<SidebarRow
										label="Method"
										value={paymentMethodLabel(payment.method)}
									/>
									<SidebarRow
										label="Status"
										value={
											<Badge variant={paymentBadgeVariant(payment.status)}>
												{statusLabel(payment.status)}
											</Badge>
										}
									/>
									{payment.referenceCode && (
										<SidebarRow
											label="Reference"
											value={
												<span className="break-all font-mono text-xs">
													{payment.referenceCode}
												</span>
											}
										/>
									)}
									{payment.accountSuffix && (
										<SidebarRow
											label="Account suffix"
											value={
												<span className="break-all font-mono text-xs">
													{payment.accountSuffix}
												</span>
											}
										/>
									)}
									{payment.phoneNumber && (
										<SidebarRow
											label="Phone"
											value={
												<span className="break-all">
													{payment.phoneNumber}
												</span>
											}
										/>
									)}
								</dl>

								{payment.screenshotUrl ? (
									<a
										href={payment.screenshotUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="group block max-w-full overflow-hidden rounded-xl border bg-muted/30"
									>
										<div className="relative aspect-[4/3] w-full max-w-full">
											<Image
												src={payment.screenshotUrl}
												alt="Payment screenshot"
												fill
												sizes="(max-width: 768px) 100vw, 360px"
												className="object-cover transition group-hover:scale-[1.02]"
												unoptimized
											/>
										</div>
										<p className="border-t bg-background/80 px-3 py-2 text-center text-xs text-muted-foreground">
											Tap to open full size
										</p>
									</a>
								) : (
									<p className="rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground sm:p-4">
										No screenshot on file.
									</p>
								)}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">
								No payment record for this job.
							</p>
						)}
					</SidebarCard>

					{tgPosts.length > 0 && (
						<SidebarCard title="Telegram delivery" icon={Send}>
							<ul className="space-y-2">
								{tgPosts.map((p) => (
									<li
										key={p.id}
										className="rounded-lg border bg-muted/30 px-3 py-2.5 text-sm"
									>
										<a
											href={p.messageUrl ?? "#"}
											className="font-medium break-words text-primary hover:underline"
											target="_blank"
											rel="noopener noreferrer"
										>
											Message #{p.messageId}
										</a>
										<p className="mt-1 text-xs leading-relaxed break-words text-muted-foreground">
											Topic {p.topicId ?? "general"} · {p.clickCount} clicks ·{" "}
											{formatRelativeTime(p.createdAt)}
										</p>
									</li>
								))}
							</ul>
						</SidebarCard>
					)}

					<Card className="border-dashed bg-muted/20">
						<CardContent className="flex items-start gap-3 p-3 text-sm sm:p-4">
							<Shield className="mt-0.5 size-4 shrink-0 text-primary" />
							<p className="min-w-0 break-words text-muted-foreground">
								Approving publishes to your configured Telegram channel and
								marks the job as{" "}
								<span className="font-medium text-foreground">posted</span> on
								the public site.
							</p>
						</CardContent>
					</Card>
				</aside>
			</div>
		</div>
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
		<div className="min-w-0 rounded-xl border bg-card p-3 shadow-sm sm:p-4">
			<p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
				{label}
			</p>
			<div className="mt-1.5 sm:mt-2">
				<Badge
					variant={badgeVariant}
					className="max-w-full truncate text-xs font-semibold sm:text-sm"
				>
					{value}
				</Badge>
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
		<Card className="min-w-0 overflow-hidden shadow-sm">
			<CardHeader className="border-b p-3 pb-3 sm:p-4">
				<CardTitle className="flex min-w-0 items-center gap-2 text-sm sm:text-base">
					<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<Icon className="size-4" />
					</span>
					<span className="min-w-0 break-words">{title}</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="p-3 sm:p-4">{children}</CardContent>
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
		<div className="flex flex-col gap-0.5 min-[400px]:flex-row min-[400px]:items-start min-[400px]:justify-between min-[400px]:gap-3">
			<dt className="shrink-0 text-muted-foreground">{label}</dt>
			<dd className="min-w-0 font-medium min-[400px]:text-right">{value}</dd>
		</div>
	);
}

function MetaLine({
	icon: Icon,
	text,
}: {
	icon: LucideIcon;
	text: string;
}) {
	return (
		<p className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
			<Icon className="size-3.5 shrink-0" />
			<span className="min-w-0 break-all">{text}</span>
		</p>
	);
}

function jobBadgeVariant(
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
		case "refunded":
			return "destructive";
		default:
			return "secondary";
	}
}
