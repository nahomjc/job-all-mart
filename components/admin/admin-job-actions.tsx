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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	AdminJobReviewWizard,
	type AdminReviewPayment,
} from "@/components/admin/admin-job-review-wizard";
import {
	type AdminActionState,
	featureJobAction,
	markJobPostedAction,
	rejectJobAction,
	rejectPaymentAction,
	republishJobAction,
	scheduleJobAction,
} from "@/server/actions/admin";
import {
	Briefcase,
	CalendarClock,
	Pin,
	Rocket,
	Send,
	Settings2,
	ShieldCheck,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useTransition } from "react";
import { toast } from "sonner";

const initial: AdminActionState = { ok: false };

interface AdminJobActionsProps {
	jobId: string;
	jobTitle: string;
	jobCompany: string;
	jobStatus: string;
	payment: AdminReviewPayment | null;
	jobDetails: React.ReactNode;
}

export function AdminJobActions(props: AdminJobActionsProps) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();

	const isStuckAtApproved =
		props.jobStatus === "approved" || props.jobStatus === "scheduled";
	const isPosted = props.jobStatus === "posted";

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
		<Card
			data-tour="job-review-moderation"
			className="min-w-0 overflow-hidden border-primary/15 shadow-sm"
		>
			<CardHeader className="border-b bg-muted/30 p-3 sm:p-4 md:p-6">
				<CardTitle className="text-base sm:text-lg">Moderation</CardTitle>
				<CardDescription className="text-xs sm:text-sm">
					Verify payment, approve the job, or use secondary actions.
				</CardDescription>
			</CardHeader>

			<CardContent className="p-3 sm:p-4 md:p-6">
				<Tabs defaultValue="verify" className="min-w-0">
					<TabsList className="mb-4 grid h-auto w-full grid-cols-1 gap-1 p-1 sm:grid-cols-3">
						<TabsTrigger
							value="verify"
							data-tour="job-review-tab-verify"
							className="h-10 gap-2 px-2 text-xs sm:px-3 sm:text-sm"
						>
							<ShieldCheck className="size-4 shrink-0" />
							<span className="truncate">Verification</span>
						</TabsTrigger>
						<TabsTrigger
							value="details"
							data-tour="job-review-tab-details"
							className="h-10 gap-2 px-2 text-xs sm:px-3 sm:text-sm"
						>
							<Briefcase className="size-4 shrink-0" />
							Job details
						</TabsTrigger>
						<TabsTrigger
							value="actions"
							data-tour="job-review-tab-actions"
							className="h-10 gap-2 px-2 text-xs sm:px-3 sm:text-sm"
						>
							<Settings2 className="size-4 shrink-0" />
							<span className="truncate">More actions</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="verify" className="mt-0 min-w-0">
						<AdminJobReviewWizard
							embedded
							jobId={props.jobId}
							jobTitle={props.jobTitle}
							jobCompany={props.jobCompany}
							jobStatus={props.jobStatus}
							payment={props.payment}
						/>
					</TabsContent>

					<TabsContent value="details" className="mt-0 min-w-0">
						{props.jobDetails}
					</TabsContent>

					<TabsContent value="actions" className="mt-0 min-w-0 space-y-4 sm:space-y-6">
						<p className="text-sm text-muted-foreground">
							Reject, schedule, feature, or recover a failed Telegram publish.
						</p>

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

				<div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:gap-6">
					<ActionBlock
						icon={XCircle}
						title="Reject job"
						description="Send the submission back with a reason."
						tone="destructive"
					>
						<RejectJobForm jobId={props.jobId} disabled={isPosted} />
					</ActionBlock>

					{props.payment && (
						<ActionBlock
							icon={XCircle}
							title="Reject payment"
							description="Invalid or mismatched proof — blocks approval."
							tone="destructive"
						>
							<RejectPaymentForm paymentId={props.payment.id} />
						</ActionBlock>
					)}

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
					</TabsContent>
				</Tabs>
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
