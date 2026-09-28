"use client";

import {
	useActionState,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	useTransition,
} from "react";
import { useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FileUploader } from "@/components/file-uploader";
import { FormStepper, type FormStep } from "@/components/form-stepper";
import { PayToTelebirrCard } from "@/components/jobs/pay-to-telebirr-card";
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
import { paymentFormStepSchemas } from "@/lib/validations/payment";
import {
	checkPaymentReferenceAction,
	submitPaymentAction,
	type ActionState,
} from "@/server/actions/jobs";

const initial: ActionState = { ok: false };

const STEP_SCHEMAS = [
	paymentFormStepSchemas.amount,
	paymentFormStepSchemas.reference,
] as const;

type VerificationResult = {
	provider?: string | null;
	status?: string;
	transactionId?: string | null;
	amount?: number | null;
};

export function PaymentForm({
	jobId,
	successHref,
	cancelHref,
	variant = "steps",
}: {
	jobId: string;
	successHref?: string;
	cancelHref?: string;
	/** `single` shows all payment fields on one screen (no nested stepper). */
	variant?: "steps" | "single";
}) {
	const locale = useLocale() as "en" | "am";
	const tp = useTranslations("payment");
	const tc = useTranslations("common");
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);
	const [stepIndex, setStepIndex] = useState(0);
	const [stepErrors, setStepErrors] = useState<Record<string, string[]>>({});
	const [state, action, pending] = useActionState(submitPaymentAction, initial);
	const [checking, startCheck] = useTransition();
	const [method, setMethod] = useState<PaymentVerifyMethod>("telebirr");
	const [verified, setVerified] = useState<VerificationResult | null>(null);
	const doneHref = successHref ?? `/dashboard/jobs/${jobId}`;
	const isSingle = variant === "single";

	const steps: FormStep[] = useMemo(
		() => [
			{
				id: "amount",
				title: tp("amountStep"),
				short: locale === "am" ? "መጠን" : "Amount",
			},
			{
				id: "reference",
				title: tp("referenceStep"),
				short: locale === "am" ? "ግብይት" : "Reference",
			},
			{
				id: "proof",
				title: tp("proofStep"),
				short: locale === "am" ? "ደረሰኝ" : "Proof",
			},
		],
		[tp, locale],
	);

	const isLastStep = isSingle || stepIndex === steps.length - 1;

	const selectedMethod = useMemo(
		() => PAYMENT_METHOD_OPTIONS.find((m) => m.value === method),
		[method],
	);

	const showSuffix = methodNeedsAccountSuffix(method);
	const showPhone = methodNeedsPhoneNumber(method);

	useEffect(() => {
		if (state.ok) {
			toast.success(tp("successToast"));
			router.push(doneHref);
		} else if (state.error && !state.fieldErrors) {
			toast.error(state.error);
		}
	}, [state.ok, state.error, state.fieldErrors, router, doneHref, tp]);

	const clearVerification = () => setVerified(null);

	const validateCurrentStep = useCallback(() => {
		if (isSingle || !formRef.current || isLastStep) return true;
		const fd = Object.fromEntries(new FormData(formRef.current));
		const schema = STEP_SCHEMAS[stepIndex];
		if (!schema) return true;
		const parsed = schema.safeParse(fd);
		if (!parsed.success) {
			setStepErrors(parsed.error.flatten().fieldErrors);
			return false;
		}
		setStepErrors({});
		return true;
	}, [stepIndex, isLastStep, isSingle]);

	const goNext = () => {
		if (!validateCurrentStep()) return;
		setStepIndex((i) => Math.min(i + 1, steps.length - 1));
	};

	const goBack = () => {
		setStepErrors({});
		setStepIndex((i) => Math.max(i - 1, 0));
	};

	const runCheck = () => {
		if (!formRef.current) return;
		const fd = new FormData(formRef.current);
		startCheck(async () => {
			const r = await checkPaymentReferenceAction(fd);
			if (!r.ok) {
				setVerified(null);
				toast.error(
					r.error ?? (locale === "am" ? "ማረጋገጥ አልተሳካም" : "Reference check failed"),
				);
				return;
			}
			const d = (r.data ?? {}) as VerificationResult;
			setVerified(d);
			const parts = [
				d.provider
					? `${locale === "am" ? "አገልግሎት ሰጪ" : "Provider"}: ${d.provider}`
					: null,
				d.status
					? `${locale === "am" ? "ሁኔታ" : "Status"}: ${d.status}`
					: null,
				d.transactionId
					? `${locale === "am" ? "የግብይት ቁጥር" : "Txn"}: ${d.transactionId}`
					: null,
				d.amount != null
					? `${locale === "am" ? "መጠን" : "Amount"}: ${d.amount}`
					: null,
			].filter(Boolean);
			toast.success(
				parts.length
					? `${tp("referenceVerified")}. ${parts.join(" · ")}`
					: tp("referenceVerified"),
			);
		});
	};

	const mergedErrors = {
		...stepErrors,
		...(state.fieldErrors ?? {}),
	};

	const getMethodLabel = (val: PaymentVerifyMethod, defaultLabel: string) => {
		if (locale === "am") {
			switch (val) {
				case "cbe":
					return "የኢትዮጵያ ንግድ ባንክ (CBE)";
				case "telebirr":
					return "ቴሌብር (telebirr)";
				case "dashen":
					return "ዳሽን ባንክ (Dashen Bank)";
				case "abyssinia":
					return "አቢሲኒያ ባንክ (Bank of Abyssinia)";
				case "cbebirr":
					return "ሲቢኢ ብር (CBE Birr)";
				case "mpesa":
					return "ኤም-ፔሳ (M-Pesa)";
			}
		}
		return defaultLabel;
	};

	const getMethodHint = (val: PaymentVerifyMethod, defaultHint: string) => {
		if (locale === "am") {
			switch (val) {
				case "cbe":
					return "ንግድ ባንክ፤ የደረሰኝ ቁጥር እና የሂሳብ ቁጥር የመጨረሻ 4 ድጅቶች";
				case "telebirr":
					return "ቴሌብር፤ የግብይት ቁጥር ብቻ (Transaction No.)";
				case "dashen":
					return "ዳሽን ባንክ፤ የደረሰኝ / ግብይት ቁጥር";
				case "abyssinia":
					return "አቢሲኒያ ባንክ፤ የደረሰኝ ቁጥር እና የሂሳብ ቁጥር ማጠቃለያ";
				case "cbebirr":
					return "ሲቢኢ ብር፤ የደረሰኝ ቁጥር እና ስልክ ቁጥር";
				case "mpesa":
					return "ኤም-ፔሳ፤ የደረሰኝ ቁጥር እና ስልክ ቁጥር";
			}
		}
		return defaultHint;
	};

	return (
		<form ref={formRef} action={action} noValidate className="space-y-5">
			<input type="hidden" name="jobId" value={jobId} />
			<input type="hidden" name="method" value={method} />

			{!isSingle ? (
				<FormStepper
					steps={steps}
					stepIndex={stepIndex}
					onStepClick={setStepIndex}
					ariaLabel="Payment progress"
				/>
			) : null}

			<PayToTelebirrCard />

			<div className={cn(!isSingle && stepIndex !== 0 && "hidden")}>
				<Card className="border-primary/20">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">{tp("howMuchPaid")}</CardTitle>
						<CardDescription>{tp("amountPaidDescription")}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-1.5">
								<Label htmlFor="amount">{tp("amountPaid")}</Label>
								<Input
									id="amount"
									name="amount"
									type="number"
									min={0}
									placeholder="500"
								/>
								{mergedErrors.amount?.[0] && (
									<p className="text-xs text-destructive">
										{mergedErrors.amount[0]}
									</p>
								)}
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="currency">{tp("currency")}</Label>
								<Select name="currency" defaultValue="ETB">
									<SelectTrigger id="currency">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ETB">
											ETB - {locale === "am" ? "የኢትዮጵያ ብር" : "Ethiopian Birr"}
										</SelectItem>
										<SelectItem value="USD">
											USD - {locale === "am" ? "የአሜሪካ ዶላር" : "US Dollar"}
										</SelectItem>
										<SelectItem value="EUR">
											EUR - {locale === "am" ? "ዩሮ" : "Euro"}
										</SelectItem>
									</SelectContent>
								</Select>
								{mergedErrors.currency?.[0] && (
									<p className="text-xs text-destructive">
										{mergedErrors.currency[0]}
									</p>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className={cn(!isSingle && stepIndex !== 1 && "hidden")}>
				<Card
					className={cn(
						"transition-colors duration-300",
						verified &&
							"border-amber-500/50 bg-amber-50/80 shadow-sm shadow-amber-500/10 dark:bg-amber-950/25",
					)}
				>
					<CardHeader className="pb-3">
						<div className="flex items-start justify-between gap-3">
							<div>
								<CardTitle className="text-base">
									{tp("referenceVerification")}
								</CardTitle>
								<CardDescription>{tp("referenceDescription")}</CardDescription>
							</div>
							{verified && (
								<span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
									<CheckCircle2 className="size-3.5" />
									{tp("referenceVerified")}
								</span>
							)}
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="method">{tp("paymentMethod")}</Label>
							<Select
								value={method}
								onValueChange={(v) => {
									setMethod(v as PaymentVerifyMethod);
									clearVerification();
								}}
							>
								<SelectTrigger id="method">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{PAYMENT_METHOD_OPTIONS.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{getMethodLabel(opt.value, opt.label)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{selectedMethod && (
								<p className="text-xs text-muted-foreground">
									{getMethodHint(selectedMethod.value, selectedMethod.hint)}
								</p>
							)}
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="referenceCode">
								{tp("transactionReference")}{" "}
								<span className="font-normal text-muted-foreground">
									{tp("optional")}
								</span>
							</Label>
							<Input
								id="referenceCode"
								name="referenceCode"
								placeholder="e.g. FT253089F68Z"
								maxLength={64}
								autoComplete="off"
								onChange={clearVerification}
							/>
							<p className="text-xs text-muted-foreground">
								{locale === "am"
									? "ከንግድ ባንክ፣ ከቴሌብር ወይም ከሌላ ደረሰኝዎ ላይ የተመለከተው የግብይት ቁጥር።"
									: "From your CBE, Telebirr, or other receipt."}
							</p>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							{showSuffix && (
								<div className="space-y-1.5">
									<Label htmlFor="accountSuffix">{tp("accountSuffix")}</Label>
									<Input
										id="accountSuffix"
										name="accountSuffix"
										placeholder="e.g. 1000468683408"
										maxLength={32}
										autoComplete="off"
										onChange={clearVerification}
									/>
									<p className="text-xs text-muted-foreground">
										{locale === "am"
											? "የመረጡት የክፍያ መንገድ የሚፈልገውን የመጨረሻ ዲጂቶች በራሱ ይጠቀማል።"
											: "We auto-use the last digits required by your method."}
									</p>
								</div>
							)}

							{showPhone && (
								<div className="space-y-1.5">
									<Label htmlFor="phoneNumber">{tp("phoneNumber")}</Label>
									<Input
										id="phoneNumber"
										name="phoneNumber"
										placeholder="09xxxxxxxx"
										maxLength={20}
										autoComplete="tel"
										onChange={clearVerification}
									/>
								</div>
							)}
						</div>

						{verified && (
							<div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
								<p className="font-medium">
									{locale === "am"
										? "የግብይት ቁጥሩ በትክክል ተረጋግጧል"
										: "Reference verified successfully"}
								</p>
								{(verified.status || verified.amount != null) && (
									<p className="mt-0.5 text-xs text-amber-700/90 dark:text-amber-300/90">
										{[
											verified.status,
											verified.amount != null
												? `${locale === "am" ? "መጠን" : "Amount"}: ${verified.amount}`
												: null,
										]
											.filter(Boolean)
											.join(" · ")}
									</p>
								)}
							</div>
						)}

						<div className="flex justify-end">
							<Button
								type="button"
								variant={verified ? "secondary" : "outline"}
								onClick={runCheck}
								disabled={checking}
							>
								{checking
									? tp("checking")
									: verified
										? locale === "am"
											? "እንደገና አረጋግጥ"
											: "Check again"
										: tp("checkReference")}
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className={cn(!isSingle && stepIndex !== 2 && "hidden")}>
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">{tp("uploadProof")}</CardTitle>
						<CardDescription>{tp("uploadProofDescription")}</CardDescription>
					</CardHeader>
					<CardContent>
						<FileUploader
							kind="payment"
							name="screenshotKey"
							label={tp("proofScreenshot")}
							helperText="PNG, JPG, WebP, or GIF. Up to 5 MB."
						/>
						{mergedErrors.screenshotKey?.[0] && (
							<p className="mt-2 text-xs text-destructive">
								{mergedErrors.screenshotKey[0]}
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			{state.error && (
				<div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
					{state.error}
				</div>
			)}

			<div className="flex justify-between gap-2 border-t pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => {
						if (!isSingle && stepIndex !== 0) {
							goBack();
							return;
						}
						if (cancelHref) {
							router.push(cancelHref);
							return;
						}
						router.back();
					}}
				>
					{isSingle || stepIndex === 0 ? tc("cancel") : tc("back")}
				</Button>
				{isLastStep ? (
					<Button type="submit" disabled={pending}>
						{pending ? tp("submitting") : tp("submitPayment")}
					</Button>
				) : (
					<Button type="button" onClick={goNext}>
						{tc("continue")}
					</Button>
				)}
			</div>
		</form>
	);
}
