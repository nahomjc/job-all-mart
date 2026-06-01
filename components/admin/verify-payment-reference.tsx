"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	methodAccountSuffixLength,
	PAYMENT_METHOD_OPTIONS,
	methodNeedsAccountSuffix,
	methodNeedsPhoneNumber,
	type PaymentVerifyMethod,
} from "@/lib/payment-methods";
import { cn } from "@/lib/utils";
import {
	verifyPaymentReferenceAction,
	type AdminActionState,
} from "@/server/actions/admin";

const initial: AdminActionState = { ok: false };

type VerificationResult = {
	provider?: string | null;
	status?: string;
	transactionId?: string | null;
	amount?: number | null;
};

interface VerifyPaymentReferenceProps {
	paymentId: string;
	defaultReference?: string | null;
	defaultMethod?: string;
	defaultAccountSuffix?: string | null;
	defaultPhoneNumber?: string | null;
}

export function VerifyPaymentReference({
	paymentId,
	defaultReference,
	defaultMethod = "telebirr",
	defaultAccountSuffix,
	defaultPhoneNumber,
}: VerifyPaymentReferenceProps) {
	const [state, action, pending] = useActionState(
		verifyPaymentReferenceAction,
		initial,
	);
	const initialMethod = PAYMENT_METHOD_OPTIONS.some(
		(m) => m.value === defaultMethod,
	)
		? (defaultMethod as PaymentVerifyMethod)
		: "telebirr";
	const [method, setMethod] = useState<PaymentVerifyMethod>(initialMethod);
	const [verified, setVerified] = useState<VerificationResult | null>(null);

	const clearVerification = () => setVerified(null);

	useEffect(() => {
		if (!state.ok && !state.error) return;
		if (state.ok) {
			const d = (state.data ?? {}) as VerificationResult;
			setVerified(d);
			const parts = [
				d.provider ? `Provider: ${d.provider}` : null,
				d.status ? `Status: ${d.status}` : null,
				d.transactionId ? `Txn: ${d.transactionId}` : null,
				d.amount != null ? `Amount: ${d.amount}` : null,
			].filter(Boolean);
			toast.success(
				parts.length > 0
					? `Reference verified — ${parts.join(" · ")}`
					: "Reference verified",
			);
		} else if (state.error) {
			setVerified(null);
			toast.error(state.error);
		}
	}, [state]);

	const showSuffix = methodNeedsAccountSuffix(method);
	const showPhone = methodNeedsPhoneNumber(method);
	const requiredSuffixLength = methodAccountSuffixLength(method);

	return (
		<form
			action={action}
			className={cn(
				"min-w-0 space-y-3 rounded-xl border p-3 transition-colors duration-300 sm:p-4",
				verified
					? "border-emerald-500/50 bg-emerald-50/80 shadow-sm shadow-emerald-500/10 dark:bg-emerald-950/25"
					: "bg-muted/20",
			)}
		>
			<input type="hidden" name="paymentId" value={paymentId} />
			<input type="hidden" name="method" value={method} />

			<div className="flex flex-col gap-2 min-[400px]:flex-row min-[400px]:items-start min-[400px]:justify-between min-[400px]:gap-3">
				<div className="min-w-0">
					<p className="text-sm font-semibold">Check reference</p>
					<p className="text-xs leading-relaxed break-words text-muted-foreground">
						Verify against{" "}
						<a
							href="https://verify.leul.et/docs"
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary underline-offset-2 hover:underline"
						>
							Leul verifier
						</a>{" "}
						(CBE, Telebirr, Dashen, and others).
					</p>
				</div>
				{verified && (
					<span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
						<CheckCircle2 className="size-3.5" />
						Verified
					</span>
				)}
			</div>

			<div className="space-y-1.5">
				<Label htmlFor={`verify-method-${paymentId}`}>Method</Label>
				<Select
					value={method}
					onValueChange={(v) => {
						setMethod(v as PaymentVerifyMethod);
						clearVerification();
					}}
				>
					<SelectTrigger id={`verify-method-${paymentId}`}>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{PAYMENT_METHOD_OPTIONS.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-1.5">
				<Label htmlFor={`verify-ref-${paymentId}`}>
					Reference{" "}
					<span className="font-normal text-muted-foreground">(required to check)</span>
				</Label>
				<Input
					id={`verify-ref-${paymentId}`}
					name="reference"
					defaultValue={defaultReference ?? ""}
					placeholder="FT253089F68Z"
					maxLength={64}
					className="font-mono text-sm"
					autoComplete="off"
					onChange={clearVerification}
				/>
			</div>

			{showSuffix && (
				<div className="space-y-1.5">
					<Label htmlFor={`verify-suffix-${paymentId}`}>
						Account number or suffix{" "}
						<span className="font-normal text-muted-foreground">
							(required, we use last {requiredSuffixLength ?? "specific"} digits)
						</span>
					</Label>
					<Input
						id={`verify-suffix-${paymentId}`}
						name="accountSuffix"
						defaultValue={defaultAccountSuffix ?? ""}
						placeholder={
							requiredSuffixLength === 8
								? "Last 8 digits (e.g. 16825193)"
								: "Last 5 digits (e.g. 825193 -> 25193)"
						}
						inputMode="numeric"
						maxLength={32}
						autoComplete="off"
						onChange={clearVerification}
					/>
					<p className="text-xs text-muted-foreground">
						You can paste the full account number. We automatically use the
						last {requiredSuffixLength ?? ""} digits for verification.
					</p>
				</div>
			)}

			{showPhone && (
				<div className="space-y-1.5">
					<Label htmlFor={`verify-phone-${paymentId}`}>
						Phone{" "}
						<span className="font-normal text-muted-foreground">(optional)</span>
					</Label>
					<Input
						id={`verify-phone-${paymentId}`}
						name="phoneNumber"
						defaultValue={defaultPhoneNumber ?? ""}
						placeholder="09xxxxxxxx"
						maxLength={20}
						autoComplete="tel"
						onChange={clearVerification}
					/>
				</div>
			)}

			{verified && (
				<div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200">
					<p className="font-medium">Reference verified successfully</p>
					{(verified.status || verified.amount != null) && (
						<p className="mt-0.5 text-xs text-emerald-700/90 dark:text-emerald-300/90">
							{[
								verified.status,
								verified.amount != null ? `Amount: ${verified.amount}` : null,
							]
								.filter(Boolean)
								.join(" · ")}
						</p>
					)}
				</div>
			)}

			<Button
				type="submit"
				className="h-11 w-full"
				variant={verified ? "secondary" : "default"}
				disabled={pending}
			>
				<Search className="size-3.5" />
				{pending ? "Checking…" : verified ? "Check again" : "Check reference"}
			</Button>
		</form>
	);
}
