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
import {
	type AdminActionState,
	approveJobAction,
	featureJobAction,
	markJobPostedAction,
	rejectJobAction,
	rejectPaymentAction,
	republishJobAction,
	scheduleJobAction,
	testLeulVerifyPaymentByReferenceAction,
	verifyPaymentAction,
} from "@/server/actions/admin";
import {
	CalendarClock,
	CheckCircle2,
	Pin,
	Rocket,
	Search,
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
	paymentReferenceCode?: string | null;
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

	const runLeulVerifyTest = () => {
		const paymentId = props.paymentId;
		if (!paymentId) return;
		startTransition(async () => {
			const r = await testLeulVerifyPaymentByReferenceAction(paymentId);
			if (r.ok) {
				const d = r.data as
					| {
							provider?: string | null;
							status?: string;
							transactionId?: string | null;
					  }
					| undefined;
				toast.success(`Leul verified${d?.provider ? ` (${d.provider})` : ""}`);
			} else {
				toast.error(r.error ?? "Leul verification failed");
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
		<Card className="overflow-hidden border-primary/15 shadow-sm">
			<CardHeader className="border-b bg-muted/30 pb-4">
				<div className="flex items-start gap-3">
					<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
						<ShieldAlert className="size-5" />
					</span>
					<div>
						<CardTitle className="text-lg">Moderation</CardTitle>
						<CardDescription className="mt-1">
							Verify payment proof, then approve to publish the job to Telegram
							and the website.
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-6 p-6">
				{needsPaymentVerify && (
					<div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
						<p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
							Payment awaiting verification
						</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Status: <span className="font-medium">{props.paymentStatus}</span>
							. Confirm the screenshot in the panel on the right before
							approving.
						</p>
						<div className="mt-3 flex flex-wrap gap-2">
							<Button
								size="sm"
								variant="success"
								onClick={runVerifyPayment}
								disabled={pending}
							>
								<CheckCircle2 className="size-3.5" />
								Verify payment
							</Button>
							{props.paymentReferenceCode && (
								<Button
									size="sm"
									variant="outline"
									onClick={runLeulVerifyTest}
									disabled={pending}
								>
									<Search className="size-3.5" />
									Verify by reference (Leul test)
								</Button>
							)}
							{props.paymentId && (
								<RejectPaymentForm paymentId={props.paymentId} />
							)}
						</div>
					</div>
				)}

				{isStuckAtApproved && (
					<div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
						<p className="text-sm font-semibold text-primary">
							Approved but not posted yet
						</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Telegram publish may have failed. Retry publishing or mark as
							posted for local testing without Telegram.
						</p>
						<div className="mt-3 flex flex-wrap gap-2">
							<Button
								size="sm"
								variant="default"
								onClick={runRepublish}
								disabled={pending}
							>
								<Send className="size-3.5" />
								Retry Telegram publish
							</Button>
							<Button
								size="sm"
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

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<Button
						size="lg"
						className="flex-1 sm:flex-none"
						onClick={runApprove}
						disabled={pending || isPosted || needsPaymentVerify}
						variant="success"
					>
						<CheckCircle2 className="size-4" />
						{pending ? "Processing…" : "Approve & publish"}
					</Button>
					{isPosted && (
						<p className="text-sm text-muted-foreground">
							This job is already live.
						</p>
					)}
				</div>

				<Separator />

				<div className="grid gap-6 md:grid-cols-2">
					<ActionBlock
						icon={XCircle}
						title="Reject job"
						description="Send the submission back with a reason."
					>
						<RejectJobForm jobId={props.jobId} disabled={isPosted} />
					</ActionBlock>

					<ActionBlock
						icon={CalendarClock}
						title="Schedule"
						description="Publish automatically at a future time."
					>
						<ScheduleJobForm jobId={props.jobId} />
					</ActionBlock>

					<ActionBlock
						icon={Pin}
						title="Feature"
						description="Pin the post in the channel for a set number of days."
						className="md:col-span-2"
					>
						<FeatureJobForm jobId={props.jobId} />
					</ActionBlock>
				</div>
			</CardContent>
		</Card>
	);
}

function ActionBlock({
	icon: Icon,
	title,
	description,
	children,
	className,
}: {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	description: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={className}>
			<div className="mb-3 flex items-start gap-2">
				<Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
				<div>
					<p className="text-sm font-semibold">{title}</p>
					<p className="text-xs text-muted-foreground">{description}</p>
				</div>
			</div>
			{children}
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
		<form action={action} className="space-y-2">
			<input type="hidden" name="jobId" value={jobId} />
			<Input
				name="reason"
				placeholder="Reason for rejection…"
				required
				disabled={disabled || pending}
			/>
			<Button
				type="submit"
				variant="destructive"
				size="sm"
				className="w-full"
				disabled={disabled || pending}
			>
				Reject job
			</Button>
		</form>
	);
}

function ScheduleJobForm({ jobId }: { jobId: string }) {
	const [state, action, pending] = useActionState(scheduleJobAction, initial);
	useActionToast(state, "Job scheduled");

	return (
		<form action={action} className="space-y-2">
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
			/>
			<Button
				type="submit"
				variant="secondary"
				size="sm"
				className="w-full"
				disabled={pending}
			>
				Schedule publish
			</Button>
		</form>
	);
}

function FeatureJobForm({ jobId }: { jobId: string }) {
	const [state, action, pending] = useActionState(featureJobAction, initial);
	useActionToast(state, "Job featured");

	return (
		<form action={action} className="flex flex-wrap items-end gap-3">
			<input type="hidden" name="jobId" value={jobId} />
			<div className="space-y-1.5">
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
					className="w-24"
					disabled={pending}
				/>
			</div>
			<Button type="submit" variant="outline" size="sm" disabled={pending}>
				Apply feature
			</Button>
		</form>
	);
}

function RejectPaymentForm({ paymentId }: { paymentId: string }) {
	const [state, action, pending] = useActionState(rejectPaymentAction, initial);
	useActionToast(state, "Payment rejected");

	return (
		<form action={action} className="flex flex-wrap gap-2">
			<input type="hidden" name="paymentId" value={paymentId} />
			<Input
				name="reason"
				placeholder="Reject reason…"
				required
				className="min-w-[140px] flex-1"
				disabled={pending}
			/>
			<Button type="submit" variant="destructive" size="sm" disabled={pending}>
				Reject payment
			</Button>
		</form>
	);
}
