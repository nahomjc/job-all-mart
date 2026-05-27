import { AdminJobActions } from "@/components/admin/admin-job-actions";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatRelativeTime, formatSalary, statusLabel } from "@/lib/format";
import { jobRepo } from "@/server/repositories/job";
import { paymentRepo } from "@/server/repositories/payment";
import { telegramPostRepo } from "@/server/repositories/telegramPost";
import type { LucideIcon } from "lucide-react";
import {
	ArrowLeft,
	AtSign,
	Briefcase,
	Building2,
	Calendar,
	ExternalLink,
	Mail,
	MapPin,
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
		<div className="space-y-8">
			<PageHeader
				eyebrow="Job review"
				title={job.title}
				description={
					<span className="flex flex-wrap items-center gap-2">
						<span className="inline-flex items-center gap-1.5">
							<Building2 className="size-3.5" />
							{job.company}
						</span>
						<span className="text-muted-foreground/60">·</span>
						<span>{category?.name ?? "Uncategorized"}</span>
					</span>
				}
				actions={
					<Button asChild variant="outline" size="sm">
						<Link href="/admin/jobs">
							<ArrowLeft className="size-3.5" />
							Back to queue
						</Link>
					</Button>
				}
			/>

			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
			</div>

			<div className="grid gap-6 xl:grid-cols-[1fr_360px]">
				<div className="space-y-6">
					<AdminJobActions
						jobId={job.id}
						paymentId={payment?.id}
						paymentStatus={payment?.status}
						paymentReferenceCode={payment?.referenceCode}
						jobStatus={job.status}
					/>

					<Card>
						<CardHeader className="border-b bg-muted/20">
							<CardTitle className="text-lg">Job details</CardTitle>
							<CardDescription>
								Full submission content and metadata.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6 p-6">
							<div className="grid gap-4 sm:grid-cols-2">
								<DetailItem
									icon={Briefcase}
									label="Employment type"
									value={statusLabel(job.employmentType)}
								/>
								<DetailItem
									icon={MapPin}
									label="Location"
									value={job.location}
								/>
								<DetailItem
									label="Salary"
									value={formatSalary(
										job.salaryMin,
										job.salaryMax,
										job.salaryCurrency,
									)}
								/>
								<DetailItem
									icon={Calendar}
									label="Submitted"
									value={formatRelativeTime(job.createdAt)}
								/>
								{job.applyUrl && (
									<DetailItem
										label="Apply link"
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
									Description
								</p>
								<div className="mt-3 rounded-xl border bg-muted/20 p-4 text-sm leading-relaxed whitespace-pre-line">
									{job.description}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<aside className="space-y-4">
					<SidebarCard title="Employer" icon={User}>
						{employer ? (
							<div className="space-y-3">
								<p className="font-semibold">
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
								<Button asChild variant="outline" size="sm" className="w-full">
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
								<dl className="space-y-2 text-sm">
									<SidebarRow
										label="Amount"
										value={`${payment.amount} ${payment.currency}`}
									/>
									<SidebarRow
										label="Method"
										value={statusLabel(payment.method)}
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
												<span className="font-mono text-xs">
													{payment.referenceCode}
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
										className="group block overflow-hidden rounded-xl border bg-muted/30"
									>
										<Image
											src={payment.screenshotUrl}
											alt="Payment screenshot"
											width={640}
											height={480}
											className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]"
											unoptimized
										/>
										<p className="border-t bg-background/80 px-3 py-2 text-center text-xs text-muted-foreground">
											Click to open full size
										</p>
									</a>
								) : (
									<p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
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
											className="font-medium text-primary hover:underline"
											target="_blank"
											rel="noopener noreferrer"
										>
											Message #{p.messageId}
										</a>
										<p className="mt-1 text-xs text-muted-foreground">
											Topic {p.topicId ?? "general"} · {p.clickCount} clicks ·{" "}
											{formatRelativeTime(p.createdAt)}
										</p>
									</li>
								))}
							</ul>
						</SidebarCard>
					)}

					<Card className="border-dashed bg-muted/20">
						<CardContent className="flex items-start gap-3 p-4 text-sm">
							<Shield className="mt-0.5 size-4 shrink-0 text-primary" />
							<p className="text-muted-foreground">
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
		<div className="rounded-xl border bg-card p-4 shadow-sm">
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
		<div className="flex items-center justify-between gap-3">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-right font-medium">{value}</dd>
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
		<p className="flex items-center gap-2 text-sm text-muted-foreground">
			<Icon className="size-3.5 shrink-0" />
			<span className="truncate">{text}</span>
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
