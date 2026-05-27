"use client";

import { useActionState, useEffect, useState } from "react";
import { Search } from "lucide-react";
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
import {
	verifyPaymentReferenceAction,
	type AdminActionState,
} from "@/server/actions/admin";

const initial: AdminActionState = { ok: false };

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

	useEffect(() => {
		if (!state.ok && !state.error) return;
		if (state.ok) {
			const d = state.data as
				| {
						provider?: string | null;
						status?: string;
						transactionId?: string | null;
						amount?: number | null;
				  }
				| undefined;
			const parts = [
				d?.provider ? `Provider: ${d.provider}` : null,
				d?.status ? `Status: ${d.status}` : null,
				d?.transactionId ? `Txn: ${d.transactionId}` : null,
				d?.amount != null ? `Amount: ${d.amount}` : null,
			].filter(Boolean);
			toast.success(
				parts.length > 0
					? `Reference verified — ${parts.join(" · ")}`
					: "Reference verified",
			);
		} else if (state.error) {
			toast.error(state.error);
		}
	}, [state]);

	const showSuffix = methodNeedsAccountSuffix(method);
	const showPhone = methodNeedsPhoneNumber(method);
	const requiredSuffixLength = methodAccountSuffixLength(method);

	return (
		<form action={action} className="space-y-3 rounded-xl border bg-muted/20 p-4">
			<input type="hidden" name="paymentId" value={paymentId} />
			<input type="hidden" name="method" value={method} />

			<div>
				<p className="text-sm font-semibold">Check reference</p>
				<p className="text-xs text-muted-foreground">
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

			<div className="space-y-1.5">
				<Label htmlFor={`verify-method-${paymentId}`}>Method</Label>
				<Select
					value={method}
					onValueChange={(v) => setMethod(v as PaymentVerifyMethod)}
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
					/>
				</div>
			)}

			<Button type="submit" size="sm" className="w-full" disabled={pending}>
				<Search className="size-3.5" />
				{pending ? "Checking…" : "Check reference"}
			</Button>
		</form>
	);
}
