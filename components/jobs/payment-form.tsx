"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { FileUploader } from "@/components/file-uploader";
import {
	PAYMENT_METHOD_OPTIONS,
	methodNeedsAccountSuffix,
	methodNeedsPhoneNumber,
	type PaymentVerifyMethod,
} from "@/lib/payment-methods";
import {
	submitPaymentAction,
	type ActionState,
} from "@/server/actions/jobs";

const initial: ActionState = { ok: false };

export function PaymentForm({ jobId }: { jobId: string }) {
	const router = useRouter();
	const [state, action, pending] = useActionState(submitPaymentAction, initial);
	const [method, setMethod] = useState<PaymentVerifyMethod>("telebirr");

	const selectedMethod = useMemo(
		() => PAYMENT_METHOD_OPTIONS.find((m) => m.value === method),
		[method],
	);

	if (state.ok) {
		toast.success("Payment submitted. Awaiting admin review.");
		router.push(`/dashboard/jobs/${jobId}`);
	} else if (state.error && !state.fieldErrors) {
		toast.error(state.error);
	}

	const showSuffix = methodNeedsAccountSuffix(method);
	const showPhone = methodNeedsPhoneNumber(method);

	return (
		<form action={action} className="space-y-5">
			<input type="hidden" name="jobId" value={jobId} />

			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor="amount">Amount paid</Label>
					<Input
						id="amount"
						name="amount"
						type="number"
						min={0}
						placeholder="10"
						required
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="currency">Currency</Label>
					<Select name="currency" defaultValue="USD" required>
						<SelectTrigger id="currency">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="USD">USD - US Dollar</SelectItem>
							<SelectItem value="ETB">ETB - Ethiopian Birr</SelectItem>
							<SelectItem value="EUR">EUR - Euro</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="space-y-1.5">
				<Label htmlFor="method">Payment method</Label>
				<Select
					name="method"
					value={method}
					onValueChange={(v) => setMethod(v as PaymentVerifyMethod)}
					required
				>
					<SelectTrigger id="method">
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
				{selectedMethod && (
					<p className="text-xs text-muted-foreground">{selectedMethod.hint}</p>
				)}
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-1.5 md:col-span-2">
					<Label htmlFor="referenceCode">
						Transaction reference{" "}
						<span className="font-normal text-muted-foreground">
							(optional)
						</span>
					</Label>
					<Input
						id="referenceCode"
						name="referenceCode"
						placeholder="e.g. FT253089F68Z"
						maxLength={64}
						autoComplete="off"
					/>
					<p className="text-xs text-muted-foreground">
						From your CBE, Telebirr, or other receipt. Leave blank if you are
						only uploading a screenshot while testing.
					</p>
				</div>

				{showSuffix && (
					<div className="space-y-1.5">
						<Label htmlFor="accountSuffix">
							Account suffix{" "}
							<span className="font-normal text-muted-foreground">
								(optional)
							</span>
						</Label>
						<Input
							id="accountSuffix"
							name="accountSuffix"
							placeholder="e.g. 16825193"
							maxLength={32}
							autoComplete="off"
						/>
					</div>
				)}

				{showPhone && (
					<div className="space-y-1.5">
						<Label htmlFor="phoneNumber">
							Phone number{" "}
							<span className="font-normal text-muted-foreground">
								(optional)
							</span>
						</Label>
						<Input
							id="phoneNumber"
							name="phoneNumber"
							placeholder="09xxxxxxxx"
							maxLength={20}
							autoComplete="tel"
						/>
					</div>
				)}
			</div>

			<FileUploader
				kind="payment"
				name="screenshotKey"
				label="Payment screenshot"
				helperText="PNG, JPG, WebP, or GIF — up to 5 MB."
			/>

			{state.error && (
				<div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
					{state.error}
				</div>
			)}

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={() => router.back()}>
					Cancel
				</Button>
				<Button type="submit" disabled={pending}>
					{pending ? "Submitting..." : "Submit payment"}
				</Button>
			</div>
		</form>
	);
}
