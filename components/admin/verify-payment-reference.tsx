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

	return (
		<form action={action} className="space-y-3 rounded-xl border bg-muted/20 p-4">
			<input type="hidden" name="paymentId" value={paymentId} />

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
					name="method"
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
						Account suffix{" "}
						<span className="font-normal text-muted-foreground">(optional)</span>
					</Label>
					<Input
						id={`verify-suffix-${paymentId}`}
						name="accountSuffix"
						defaultValue={defaultAccountSuffix ?? ""}
						placeholder="16825193"
						maxLength={32}
						autoComplete="off"
					/>
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
