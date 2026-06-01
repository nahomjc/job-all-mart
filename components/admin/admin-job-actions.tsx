"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
	type AdminActionState,
	approveJobAction,
	featureJobAction,
	markJobPostedAction,
	rejectJobAction,
	rejectPaymentAction,
	republishJobAction,
	scheduleJobAction,
	verifyPaymentAction,
} from "@/server/actions/admin";
import { statusLabel } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
	CalendarClock,
	CheckCircle2,
	ClipboardCheck,
	Clock,
	Pin,
	Receipt,
	Rocket,
	Send,
	ShieldAlert,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useTransition } from "react";
import { toast } from "sonner";

const initial: AdminActionState = { ok: false };

interface AdminJobActionsProps {
	jobId: string;
	paymentId?: string;
	paymentStatus?: string;
	jobStatus: string;
}

export function AdminJobActions(props: AdminJobActionsProps) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();

	const needsPaymentVerify =
		Boolean(props.paymentId) && props.paymentStatus !== "verified";
	const isStuckAtApproved =
		props.jobStatus === "approved" || props.jobStatus === "scheduled";
	const isPosted = props.jobStatus === "posted";

	const runApprove = () => {
		startTransition(async () => {
			const r = await approveJobAction(props.jobId);
			if (r.ok) {
				toast.success("Approved and published to Telegram");
				router.refresh();
			} else {
				toast.error(r.error ?? "Approval failed");
			}
		});
	};

	const runVerifyPayment = () => {
		const paymentId = props.paymentId;
		if (!paymentId) return;
		startTransition(async () => {
			const r = await verifyPaymentAction(paymentId);
			if (r.ok) {
				toast.success("Payment verified");
				router.refresh();
			} else {
				toast.error(r.error ?? "Failed to verify payment");
			}
		});
	};

	const runRepublish = () => {
		startTransition(async () => {
			const r = await republishJobAction(props.jobId);
			if (r.ok) {
				toast.success("Re-published to Telegram");
				router.refresh();
			} else {
				toast.error(r.error ?? "Publish failed");
			}
		});
	};

	const runMarkPosted = () => {
		startTransition(async () => {
			const r = await markJobPostedAction(props.jobId);
			if (r.ok) {
				toast.success("Marked as posted on the public site");
				router.refresh();
			} else {
				toast.error(r.error ?? "Failed");
			}
		});
	};

	return (
		<Card className="min-w-0 overflow-hidden border-primary/15 shadow-sm">
			<CardHeader className="border-b bg-muted/30 p-3 sm:p-4 md:p-6">
				<div className="flex min-w-0 items-start gap-3">
					<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
						<ShieldAlert className="size-5" />
					</span>
					<div className="min-w-0">
						<CardTitle className="text-base sm:text-lg">Moderation</CardTitle>
						<CardDescription className="mt-1 text-xs sm:text-sm">
							Verify payment proof, then approve to publish the job to Telegram
							and the website.
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4 p-3 sm:space-y-6 sm:p-4 md:p-6">
				{needsPaymentVerify && props.paymentId && (
					<PaymentAwaitingVerification
						paymentId={props.paymentId}
						paymentStatus={props.paymentStatus ?? "pending"}
						onVerify={runVerifyPayment}
						verifyPending={pending}
					/>
				)}

				{isStuckAtApproved && (
					<div className="rounded-xl border border-primary/25 bg-primary/5 p-3 sm:p-4">
						<p className="text-sm font-semibold text-primary">
							Approved but not posted yet
						</p>
						<p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
							Telegram publish may have failed. Retry publishing or mark as
							posted for local testing without Telegram.
						</p>
						<div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
							<Button
								className="h-11 w-full sm:w-auto"
								variant="default"
								onClick={runRepublish}
								disabled={pending}
							>
								<Send className="size-3.5" />
								Retry Telegram publish
							</Button>
							<Button
								className="h-11 w-full sm:w-auto"
								variant="outline"
								onClick={runMarkPosted}
								disabled={pending}
							>
								<Rocket className="size-3.5" />
								Mark posted (skip Telegram)
							</Button>
						</div>
					</div>
				)}

				<div className="flex flex-col gap-3">
					<Button
						className="h-11 w-full sm:w-auto sm:min-w-[12rem]"
						onClick={runApprove}
						disabled={pending || isPosted || needsPaymentVerify}
						variant="success"
					>
						<CheckCircle2 className="size-4" />
						{pending ? "Processing…" : "Approve & publish"}
					</Button>
					{isPosted && (
						<p className="text-xs text-muted-foreground sm:text-sm">
							This job is already live.
						</p>
					)}
				</div>

				<Separator />

				<div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:gap-6">
					<ActionBlock
						icon={XCircle}
						title="Reject job"
						description="Send the submission back with a reason."
						tone="destructive"
					>
						<RejectJobForm jobId={props.jobId} disabled={isPosted} />
					</ActionBlock>

					<ActionBlock
						icon={CalendarClock}
						title="Schedule"
						description="Publish automatically at a future time."
						tone="secondary"
					>
						<ScheduleJobForm jobId={props.jobId} />
					</ActionBlock>

					<ActionBlock
						icon={Pin}
						title="Feature"
						description="Pin the post in the channel for a set number of days."
						className="min-[480px]:col-span-2"
						tone="default"
					>
						<FeatureJobForm jobId={props.jobId} />
					</ActionBlock>
				</div>
			</CardContent>
		</Card>
	);
}

const VERIFICATION_STEPS = [
	{
		title: "Review payment proof",
		description:
			"Open the Payment proof panel below. Confirm the screenshot, amount, and reference match the submission.",
	},
	{
		title: "Check the reference",
		description:
			"Use the Leul verifier in that panel to validate the transaction reference before you mark the payment verified.",
	},
	{
		title: "Mark payment verified",
		description:
			"Once proof and reference checks pass, confirm verification here to unlock Approve & publish.",
	},
] as const;

function PaymentAwaitingVerification({
	paymentId,
	paymentStatus,
	onVerify,
	verifyPending,
}: {
	paymentId: string;
	paymentStatus: string;
	onVerify: () => void;
	verifyPending: boolean;
}) {
	const statusBadgeVariant =
		paymentStatus === "rejected" ? "destructive" : "warning";

	return (
		<section
			aria-labelledby="payment-verify-heading"
			className="min-w-0 overflow-hidden rounded-xl border border-amber-500/25 bg-linear-to-b from-amber-50/80 to-card shadow-sm dark:from-amber-950/30 dark:to-card"
		>
			<header className="flex flex-col gap-3 border-b border-amber-500/20 bg-amber-500/5 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 md:px-5">
				<div className="flex min-w-0 items-start gap-3">
					<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
						<Receipt className="size-5" />
					</span>
					<div className="min-w-0">
						<h3
							id="payment-verify-heading"
							className="text-sm font-semibold tracking-tight"
						>
							Payment verification required
						</h3>
						<p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
							<Clock className="size-3.5 shrink-0" />
							Complete all steps before approving this job
						</p>
					</div>
				</div>
				<Badge variant={statusBadgeVariant} className="w-fit shrink-0 capitalize">
					{statusLabel(paymentStatus)}
				</Badge>
			</header>

			<div className="space-y-4 p-3 sm:space-y-5 sm:p-4 md:px-5">
				<ol className="space-y-3">
					{VERIFICATION_STEPS.map((step, index) => (
						<li key={step.title} className="flex gap-3">
							<span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-semibold text-muted-foreground shadow-sm">
								{index + 1}
							</span>
							<div className="min-w-0 pt-0.5">
								<p className="text-sm font-medium leading-snug">{step.title}</p>
								<p className="mt-1.5 text-xs leading-relaxed break-words text-muted-foreground">
									{step.description}
								</p>
							</div>
						</li>
					))}
				</ol>

				<div className="rounded-lg border bg-background/80 p-3 shadow-sm sm:p-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex min-w-0 items-start gap-2.5">
							<ClipboardCheck className="mt-0.5 size-4 shrink-0 text-primary" />
							<div className="min-w-0">
								<p className="text-sm font-medium">Ready to confirm?</p>
								<p className="text-xs text-muted-foreground">
									This records the payment as verified in your system.
								</p>
							</div>
						</div>
						<Button
							variant="success"
							className="h-11 w-full shrink-0 sm:w-auto"
							onClick={onVerify}
							disabled={verifyPending}
						>
							<CheckCircle2 className="size-3.5" />
							{verifyPending ? "Verifying…" : "Mark payment verified"}
						</Button>
					</div>
				</div>

				<div className="rounded-lg border border-destructive/20 bg-destructive/3 p-3 sm:p-4">
					<p className="text-xs font-semibold uppercase tracking-wider text-destructive">
						Reject payment
					</p>
					<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
						Use only if the proof is invalid, duplicated, or does not match the
						job fee.
					</p>
					<div className="mt-3">
						<RejectPaymentForm paymentId={paymentId} />
					</div>
				</div>
			</div>
		</section>
	);
}

function ActionBlock({
	icon: Icon,
	title,
	description,
	children,
	className,
	tone = "default",
}: {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	description: string;
	children: React.ReactNode;
	className?: string;
	tone?: "default" | "secondary" | "destructive";
}) {
	const toneClasses =
		tone === "destructive"
			? "border-destructive/20 bg-destructive/[0.04]"
			: tone === "secondary"
				? "border-primary/20 bg-primary/[0.04]"
				: "border-border bg-muted/[0.25]";

	return (
		<div className={className}>
			<div
				className={`min-w-0 rounded-xl border p-3 shadow-sm sm:p-4 ${toneClasses}`}
			>
				<div className="mb-4 flex min-w-0 items-start gap-2.5">
					<span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
						<Icon className="size-4 text-muted-foreground" />
					</span>
					<div className="min-w-0">
						<p className="text-sm font-semibold">{title}</p>
						<p className="mt-1 text-xs leading-relaxed break-words text-muted-foreground">
							{description}
						</p>
					</div>
				</div>
				{children}
			</div>
		</div>
	);
}

function useActionToast(state: AdminActionState, successMessage: string) {
	const router = useRouter();
	useEffect(() => {
		if (!state.ok && !state.error) return;
		if (state.ok) {
			toast.success(successMessage);
			router.refresh();
		} else if (state.error) {
			toast.error(state.error);
		}
	}, [state, successMessage, router]);
}

function RejectJobForm({
	jobId,
	disabled,
}: {
	jobId: string;
	disabled?: boolean;
}) {
	const [state, action, pending] = useActionState(rejectJobAction, initial);
	useActionToast(state, "Job rejected");

	return (
		<form action={action} className="space-y-3">
			<input type="hidden" name="jobId" value={jobId} />
			<Label
				htmlFor={`reject-reason-${jobId}`}
				className="text-xs text-muted-foreground"
			>
				Reason for rejection
			</Label>
			<Textarea
				id={`reject-reason-${jobId}`}
				name="reason"
				rows={3}
				placeholder="Reason for rejection…"
				required
				disabled={disabled || pending}
				className="max-w-full min-w-0"
			/>
			<Button
				type="submit"
				variant="destructive"
				className="h-11 w-full sm:w-auto"
				disabled={disabled || pending}
			>
				{pending ? "Rejecting…" : "Reject job"}
			</Button>
		</form>
	);
}

function ScheduleJobForm({ jobId }: { jobId: string }) {
	const [state, action, pending] = useActionState(scheduleJobAction, initial);
	useActionToast(state, "Job scheduled");

	return (
		<form action={action} className="space-y-3">
			<input type="hidden" name="jobId" value={jobId} />
			<Label htmlFor="scheduledAt" className="text-xs text-muted-foreground">
				Publish at
			</Label>
			<Input
				id="scheduledAt"
				name="scheduledAt"
				type="datetime-local"
				required
				disabled={pending}
				className="max-w-full min-w-0"
			/>
			<Button
				type="submit"
				variant="secondary"
				className="h-11 w-full sm:w-auto"
				disabled={pending}
			>
				{pending ? "Scheduling…" : "Schedule publish"}
			</Button>
		</form>
	);
}

function FeatureJobForm({ jobId }: { jobId: string }) {
	const [state, action, pending] = useActionState(featureJobAction, initial);
	useActionToast(state, "Job featured");

	return (
		<form
			action={action}
			className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
		>
			<input type="hidden" name="jobId" value={jobId} />
			<div className="min-w-0 flex-1 space-y-1.5 sm:max-w-[8rem]">
				<Label htmlFor="pinDays" className="text-xs text-muted-foreground">
					Pin duration (days)
				</Label>
				<Input
					id="pinDays"
					name="pinDays"
					type="number"
					min={0}
					max={30}
					defaultValue={1}
					className="h-11 w-full"
					disabled={pending}
				/>
			</div>
			<Button
				type="submit"
				variant="outline"
				className="h-11 w-full sm:w-auto"
				disabled={pending}
			>
				{pending ? "Applying…" : "Apply feature"}
			</Button>
		</form>
	);
}

function RejectPaymentForm({ paymentId }: { paymentId: string }) {
	const [state, action, pending] = useActionState(rejectPaymentAction, initial);
	useActionToast(state, "Payment rejected");

	return (
		<form
			action={action}
			className="flex flex-col gap-2 sm:flex-row sm:items-end"
		>
			<input type="hidden" name="paymentId" value={paymentId} />
			<div className="min-w-0 flex-1 space-y-1.5">
				<Label htmlFor={`reject-payment-${paymentId}`} className="sr-only">
					Rejection reason
				</Label>
				<Input
					id={`reject-payment-${paymentId}`}
					name="reason"
					placeholder="Explain why this payment is being rejected…"
					required
					disabled={pending}
					className="h-11 max-w-full"
				/>
			</div>
			<Button
				type="submit"
				variant="destructive"
				className="h-11 w-full shrink-0 sm:w-auto"
				disabled={pending}
			>
				<XCircle className="size-3.5" />
				{pending ? "Rejecting…" : "Reject payment"}
			</Button>
		</form>
	);
}
