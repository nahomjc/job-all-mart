"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
	ArrowLeft,
	ArrowRight,
	Check,
	CheckCircle2,
	ClipboardList,
	ExternalLink,
	Receipt,
	Rocket,
	Search,
	ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { VerifyPaymentReference } from "@/components/admin/verify-payment-reference";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { statusLabel } from "@/lib/format";
import { paymentMethodLabel } from "@/lib/payment-methods";
import { cn } from "@/lib/utils";
import { approveJobAction, verifyPaymentAction } from "@/server/actions/admin";

export type AdminReviewPayment = {
	id: string;
	status: string;
	amount: number;
	currency: string;
	method: string;
	referenceCode: string | null;
	accountSuffix: string | null;
	phoneNumber: string | null;
	screenshotUrl: string | null;
};

type AdminJobReviewWizardProps = {
	jobId: string;
	jobTitle: string;
	jobCompany: string;
	jobStatus: string;
	payment: AdminReviewPayment | null;
	/** Renders inside a parent card/tab without duplicate chrome */
	embedded?: boolean;
};

const REVIEW_CHECKS = [
	{
		id: "screenshot",
		label: "Payment screenshot is clear and readable",
	},
	{
		id: "amount",
		label: "Amount matches the expected job fee",
	},
	{
		id: "details",
		label: "Reference / payer details match the submission",
	},
] as const;

type ReviewCheckId = (typeof REVIEW_CHECKS)[number]["id"];

function buildSteps(hasPayment: boolean, paymentVerified: boolean) {
	if (!hasPayment) {
		return [
			{ id: "review", title: "Review job", short: "Review" },
			{ id: "publish", title: "Approve & publish", short: "Publish" },
		] as const;
	}

	const steps = [
		{ id: "review", title: "Review proof", short: "Proof" },
		{ id: "reference", title: "Check reference", short: "Reference" },
	] as const;

	if (!paymentVerified) {
		return [
			...steps,
			{ id: "confirm", title: "Confirm payment", short: "Confirm" },
			{ id: "publish", title: "Approve & publish", short: "Publish" },
		] as const;
	}

	return [
		...steps,
		{ id: "publish", title: "Approve & publish", short: "Publish" },
	] as const;
}

export function AdminJobReviewWizard({
	jobId,
	jobTitle,
	jobCompany,
	jobStatus,
	payment,
	embedded = false,
}: AdminJobReviewWizardProps) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [stepIndex, setStepIndex] = useState(0);
	const [referenceChecked, setReferenceChecked] = useState(false);
	const [checks, setChecks] = useState<Record<ReviewCheckId, boolean>>({
		screenshot: false,
		amount: false,
		details: false,
	});

	const isPosted = jobStatus === "posted";
	const paymentVerified = payment?.status === "verified";
	const hasPayment = Boolean(payment);
	const steps = useMemo(
		() => buildSteps(hasPayment, paymentVerified),
		[hasPayment, paymentVerified],
	);
	const currentStep = steps[stepIndex];
	const isLastStep = stepIndex === steps.length - 1;

	useEffect(() => {
		if (paymentVerified && hasPayment) {
			const publishIdx = steps.findIndex((s) => s.id === "publish");
			if (publishIdx >= 0) setStepIndex(publishIdx);
		}
	}, [paymentVerified, hasPayment, steps]);

	const reviewComplete = REVIEW_CHECKS.every((c) => checks[c.id]);
	const referenceComplete = !hasPayment || referenceChecked || paymentVerified;
	const confirmComplete = !hasPayment || paymentVerified;

	const stepComplete = useCallback(
		(index: number) => {
			const step = steps[index];
			if (!step) return false;
			switch (step.id) {
				case "review":
					return hasPayment ? reviewComplete : true;
				case "reference":
					return referenceComplete;
				case "confirm":
					return confirmComplete;
				case "publish":
					return confirmComplete && referenceComplete && (hasPayment ? reviewComplete : true);
				default:
					return false;
			}
		},
		[
			steps,
			hasPayment,
			reviewComplete,
			referenceComplete,
			confirmComplete,
		],
	);

	const canProceed = stepComplete(stepIndex);

	const goNext = () => {
		if (!canProceed || isLastStep) return;
		setStepIndex((i) => Math.min(i + 1, steps.length - 1));
	};

	const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

	const runVerifyPayment = () => {
		if (!payment) return;
		startTransition(async () => {
			const r = await verifyPaymentAction(payment.id);
			if (r.ok) {
				toast.success("Payment marked as verified");
				router.refresh();
				const confirmIdx = steps.findIndex((s) => s.id === "confirm");
				if (confirmIdx >= 0 && stepIndex === confirmIdx) {
					setStepIndex(confirmIdx + 1);
				}
			} else {
				toast.error(r.error ?? "Failed to verify payment");
			}
		});
	};

	const runApprove = () => {
		startTransition(async () => {
			const r = await approveJobAction(jobId);
			if (r.ok) {
				toast.success("Approved and published to Telegram");
				router.refresh();
			} else {
				toast.error(r.error ?? "Approval failed");
			}
		});
	};

	if (isPosted) {
		return (
			<div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-6">
				<div className="flex items-start gap-3">
					<CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
					<div>
						<p className="font-semibold text-emerald-800 dark:text-emerald-200">
							This job is already live
						</p>
						<p className="mt-1 text-sm text-muted-foreground">
							No further verification or approval is needed.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"min-w-0 overflow-hidden",
				!embedded && "rounded-xl border border-primary/15 bg-card shadow-sm",
			)}
		>
			<header
				className={cn(
					"p-3 sm:p-4 md:p-6",
					embedded ? "px-0 pt-0" : "border-b bg-muted/30",
				)}
			>
				{!embedded && (
					<div className="mb-5 flex min-w-0 items-start gap-3 sm:mb-6">
						<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
							<ShieldCheck className="size-5" />
						</span>
						<div className="min-w-0">
							<h2 className="text-base font-semibold sm:text-lg">
								Verification & approval
							</h2>
							<p className="mt-1 text-xs text-muted-foreground sm:text-sm">
								Complete each step to verify payment and publish{" "}
								<span className="font-medium text-foreground">{jobTitle}</span>.
							</p>
						</div>
					</div>
				)}

				{embedded && (
					<p className="mb-4 text-sm text-muted-foreground">
						Complete each step to verify payment and publish{" "}
						<span className="font-medium text-foreground">{jobTitle}</span>.
					</p>
				)}

				<nav aria-label="Review progress" className="flex flex-col gap-3">
					<ol className="flex flex-wrap items-center gap-2">
						{steps.map((step, i) => {
							const done = i < stepIndex || (i === stepIndex && stepComplete(i));
							const active = i === stepIndex;
							const clickable = i < stepIndex;

							return (
								<li key={step.id} className="flex min-w-0 items-center gap-2">
									<button
										type="button"
										disabled={!clickable}
										onClick={() => clickable && setStepIndex(i)}
										className={cn(
											"flex min-w-0 items-center gap-2 rounded-full border px-2.5 py-1 text-left text-xs font-medium transition sm:px-3 sm:text-sm",
											active &&
												"border-primary bg-primary/10 text-primary shadow-sm",
											done &&
												!active &&
												"border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
											!active &&
												!done &&
												"border-border text-muted-foreground",
											clickable && "hover:bg-muted/60",
										)}
									>
										<span
											className={cn(
												"flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
												active && "bg-primary text-primary-foreground",
												done && !active && "bg-emerald-600 text-white",
												!active && !done && "bg-muted text-muted-foreground",
											)}
										>
											{done && !active ? (
												<Check className="size-3.5" />
											) : (
												i + 1
											)}
										</span>
										<span className="hidden truncate sm:inline">{step.title}</span>
										<span className="truncate sm:hidden">{step.short}</span>
									</button>
									{i < steps.length - 1 && (
										<span
											aria-hidden
											className="hidden h-px w-4 bg-border sm:block"
										/>
									)}
								</li>
							);
						})}
					</ol>
					<p className="text-xs text-muted-foreground">
						Step {stepIndex + 1} of {steps.length}:{" "}
						<span className="font-medium text-foreground">
							{currentStep?.title}
						</span>
					</p>
				</nav>
			</header>

			<div
				className={cn(
					"space-y-4 sm:space-y-6",
					embedded ? "px-0 pb-0 pt-4" : "p-3 sm:p-4 md:p-6",
				)}
			>
				{currentStep?.id === "review" && (
					<div className="space-y-4">
						<div className="rounded-xl border bg-muted/20 p-3 sm:p-4">
							<p className="text-sm font-semibold">{jobTitle}</p>
							<p className="text-sm text-muted-foreground">{jobCompany}</p>
							{payment && (
								<dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
									<div>
										<dt className="text-xs text-muted-foreground">Amount</dt>
										<dd className="font-medium">
											{payment.amount} {payment.currency}
										</dd>
									</div>
									<div>
										<dt className="text-xs text-muted-foreground">Method</dt>
										<dd className="font-medium">
											{paymentMethodLabel(payment.method)}
										</dd>
									</div>
									<div className="sm:col-span-2">
										<dt className="text-xs text-muted-foreground">Status</dt>
										<dd className="mt-0.5">
											<Badge
												variant={
													paymentVerified ? "success" : "warning"
												}
												className="capitalize"
											>
												{statusLabel(payment.status)}
											</Badge>
										</dd>
									</div>
								</dl>
							)}
						</div>

						{payment?.screenshotUrl ? (
							<a
								href={payment.screenshotUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="group block overflow-hidden rounded-xl border"
							>
								<div className="relative aspect-[4/3] w-full max-h-72">
									<Image
										src={payment.screenshotUrl}
										alt="Payment screenshot"
										fill
										sizes="(max-width: 768px) 100vw, 640px"
										className="object-contain bg-muted/30 transition group-hover:scale-[1.01]"
										unoptimized
									/>
								</div>
								<p className="flex items-center justify-center gap-1.5 border-t bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
									Open full size <ExternalLink className="size-3" />
								</p>
							</a>
						) : payment ? (
							<p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
								No payment screenshot on file.
							</p>
						) : (
							<p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
								No payment record — review the job details below, then continue
								to approval.
							</p>
						)}

						{payment && (
							<fieldset className="space-y-3 rounded-xl border p-3 sm:p-4">
								<legend className="flex items-center gap-2 px-1 text-sm font-semibold">
									<ClipboardList className="size-4 text-primary" />
									Proof checklist
								</legend>
								{REVIEW_CHECKS.map((item) => (
									<label
										key={item.id}
										className="flex cursor-pointer items-start gap-3 rounded-lg border bg-background p-3 transition hover:bg-muted/30"
									>
										<input
											type="checkbox"
											checked={checks[item.id]}
											onChange={(e) =>
												setChecks((prev) => ({
													...prev,
													[item.id]: e.target.checked,
												}))
											}
											className="mt-0.5 size-4 rounded border-input accent-primary"
										/>
										<span className="text-sm leading-snug">{item.label}</span>
									</label>
								))}
							</fieldset>
						)}
					</div>
				)}

				{currentStep?.id === "reference" && payment && (
					<div className="space-y-3">
						<div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
							<Search className="mt-0.5 size-4 shrink-0 text-primary" />
							<p className="text-muted-foreground">
								Run the Leul reference check. You must get a successful match
								before marking the payment verified.
							</p>
						</div>
						<VerifyPaymentReference
							paymentId={payment.id}
							defaultReference={payment.referenceCode}
							defaultMethod={payment.method}
							defaultAccountSuffix={payment.accountSuffix}
							defaultPhoneNumber={payment.phoneNumber}
							onVerifiedChange={(ok) => setReferenceChecked(ok)}
						/>
					</div>
				)}

				{currentStep?.id === "confirm" && payment && (
					<div className="space-y-4">
						<div className="rounded-xl border bg-muted/20 p-4">
							<div className="flex items-start gap-3">
								<Receipt className="mt-0.5 size-5 shrink-0 text-primary" />
								<div>
									<p className="font-semibold">Confirm in your system</p>
									<p className="mt-1 text-sm text-muted-foreground">
										Reference check passed. Mark this payment as verified to
										unlock final approval.
									</p>
									<dl className="mt-3 space-y-1 text-sm">
										<div className="flex justify-between gap-4">
											<dt className="text-muted-foreground">Amount</dt>
											<dd className="font-medium">
												{payment.amount} {payment.currency}
											</dd>
										</div>
										{payment.referenceCode && (
											<div className="flex justify-between gap-4">
												<dt className="text-muted-foreground">Reference</dt>
												<dd className="font-mono text-xs">
													{payment.referenceCode}
												</dd>
											</div>
										)}
									</dl>
								</div>
							</div>
						</div>
						<Button
							variant="success"
							className="h-11 w-full sm:w-auto"
							onClick={runVerifyPayment}
							disabled={pending || paymentVerified}
						>
							<CheckCircle2 className="size-4" />
							{pending
								? "Verifying…"
								: paymentVerified
									? "Payment verified"
									: "Mark payment verified"}
						</Button>
					</div>
				)}

				{currentStep?.id === "publish" && (
					<div className="space-y-4">
						<div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
							<div className="flex items-start gap-3">
								<Rocket className="mt-0.5 size-5 shrink-0 text-emerald-600" />
								<div>
									<p className="font-semibold">Ready to go live</p>
									<p className="mt-1 text-sm text-muted-foreground">
										Approving publishes{" "}
										<span className="font-medium text-foreground">
											{jobTitle}
										</span>{" "}
										to your Telegram channel and the public job board.
									</p>
									<ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
										{hasPayment && (
											<li className="flex items-center gap-2">
												<Check className="size-3.5 text-emerald-600" />
												Payment verified
											</li>
										)}
										<li className="flex items-center gap-2">
											<Check className="size-3.5 text-emerald-600" />
											Job content reviewed
										</li>
									</ul>
								</div>
							</div>
						</div>
						<Button
							variant="success"
							className="h-11 w-full sm:min-w-[14rem] sm:w-auto"
							onClick={runApprove}
							disabled={
								pending ||
								(hasPayment && !paymentVerified) ||
								(hasPayment && !reviewComplete)
							}
						>
							<CheckCircle2 className="size-4" />
							{pending ? "Publishing…" : "Approve & publish"}
						</Button>
						{hasPayment && !paymentVerified && (
							<p className="text-xs text-amber-700 dark:text-amber-300">
								Complete payment verification steps before approving.
							</p>
						)}
					</div>
				)}

				<Separator />

				<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
					<Button
						type="button"
						variant="outline"
						className="h-11 w-full sm:w-auto"
						onClick={goBack}
						disabled={stepIndex === 0 || pending}
					>
						<ArrowLeft className="size-4" />
						Back
					</Button>
					{!isLastStep ? (
						<Button
							type="button"
							className="h-11 w-full sm:w-auto"
							onClick={goNext}
							disabled={!canProceed || pending}
						>
							Continue
							<ArrowRight className="size-4" />
						</Button>
					) : null}
				</div>
			</div>
		</div>
	);
}
