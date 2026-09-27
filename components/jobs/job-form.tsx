"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useActionState } from "react";
import { toast } from "sonner";
import { FileUploader } from "@/components/file-uploader";
import { FormStepper, type FormStep } from "@/components/form-stepper";
import { PaymentForm } from "@/components/jobs/payment-form";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatLocation, statusLabel } from "@/lib/format";
import { jobFormStepSchemas } from "@/lib/validations/job";
import { type ActionState, submitJobAction } from "@/server/actions/jobs";
import type { Category } from "@/server/db/schema";

const initial: ActionState = { ok: false };

const STEP_SCHEMAS = [
	jobFormStepSchemas.basics,
	jobFormStepSchemas.details,
	jobFormStepSchemas.compensation,
	jobFormStepSchemas.apply,
] as const;

const ETHIOPIA_LOCATION_OPTIONS = [
	{ value: "Addis Ababa", labelEn: "Addis Ababa", labelAm: "አዲስ አበባ" },
	{ value: "Adama", labelEn: "Adama (Nazret)", labelAm: "አዳማ (ናዝሬት)" },
	{ value: "Bahir Dar", labelEn: "Bahir Dar", labelAm: "ባሕር ዳር" },
	{ value: "Hawassa", labelEn: "Hawassa", labelAm: "ሀዋሳ" },
	{ value: "Mekelle", labelEn: "Mekelle", labelAm: "መቀሌ" },
	{ value: "Dire Dawa", labelEn: "Dire Dawa", labelAm: "ድሬዳዋ" },
	{ value: "Gondar", labelEn: "Gondar", labelAm: "ጎንደር" },
	{ value: "Jimma", labelEn: "Jimma", labelAm: "ጅማ" },
	{ value: "Dessie", labelEn: "Dessie", labelAm: "ደሴ" },
	{ value: "Bishoftu", labelEn: "Bishoftu (Debre Zeyit)", labelAm: "ቢሾፍቱ (ደብረዘይት)" },
	{
		value: "Remote (Ethiopia)",
		labelEn: "Remote (Ethiopia)",
		labelAm: "የርቀት ስራ (Remote - Ethiopia)",
	},
	{
		value: "Hybrid (Addis Ababa)",
		labelEn: "Hybrid (Addis Ababa)",
		labelAm: "ድብልቅ - አዲስ አበባ (Hybrid)",
	},
];

const SALARY_CURRENCIES = [
	{ value: "ETB", label: "ETB - Ethiopian Birr" },
	{ value: "USD", label: "USD - US Dollar" },
	{ value: "EUR", label: "EUR - Euro" },
];

interface JobFormProps {
	categories: Pick<Category, "id" | "name">[];
	/** `simple` uses the public /post flow instead of the dashboard. */
	flow?: "dashboard" | "simple";
}

type ReviewSnapshot = Record<string, string>;

export function JobForm({ categories, flow = "dashboard" }: JobFormProps) {
	const locale = useLocale() as "en" | "am";
	const tj = useTranslations("jobs");
	const tc = useTranslations("common");
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);
	const [stepIndex, setStepIndex] = useState(0);
	const [stepErrors, setStepErrors] = useState<Record<string, string[]>>({});
	const [reviewData, setReviewData] = useState<ReviewSnapshot | null>(null);
	const [submittedJobId, setSubmittedJobId] = useState<string | null>(null);
	const [state, action, pending] = useActionState(submitJobAction, initial);
	const cancelHref = flow === "simple" ? "/" : undefined;
	const isSimple = flow === "simple";

	const steps: FormStep[] = useMemo(() => {
		const baseSteps: FormStep[] = [
			{
				id: "basics",
				title: locale === "am" ? "መሰረታዊ መረጃ" : "Job basics",
				short: locale === "am" ? "መሰረታዊ" : "Basics",
			},
			{
				id: "details",
				title: locale === "am" ? "የስራ ዝርዝር" : "Role details",
				short: locale === "am" ? "ዝርዝር" : "Details",
			},
			{
				id: "compensation",
				title: locale === "am" ? "ደመወዝ / ክፍያ" : "Compensation",
				short: locale === "am" ? "ደመወዝ" : "Pay",
			},
			{
				id: "apply",
				title: locale === "am" ? "ማመልከቻ እና አርማ" : "Apply & logo",
				short: locale === "am" ? "ማመልከቻ" : "Apply",
			},
			{
				id: "review",
				title: locale === "am" ? "መርምረው ያቅርቡ" : "Review & submit",
				short: locale === "am" ? "ግምገማ" : "Review",
			},
		];
		if (isSimple) {
			baseSteps.push({
				id: "payment",
				title: locale === "am" ? "የክፍያ ማስረጃ" : "Payment proof",
				short: locale === "am" ? "ክፍያ" : "Payment",
			});
		}
		return baseSteps;
	}, [locale, isSimple]);

	const reviewStepIndex = 4;
	const paymentStepIndex = 5;
	const isReviewStep = stepIndex === reviewStepIndex;
	const isPaymentStep =
		isSimple && stepIndex === paymentStepIndex && Boolean(submittedJobId);
	const isLastInputStep = stepIndex === 3;

	const categoryName = useMemo(() => {
		if (!reviewData?.categoryId) return "—";
		return (
			categories.find((c) => c.id === reviewData.categoryId)?.name ?? "—"
		);
	}, [categories, reviewData?.categoryId]);

	useEffect(() => {
		if (state.error && !state.fieldErrors) {
			toast.error(state.error);
		}
	}, [state.error, state.fieldErrors]);

	useEffect(() => {
		if (!isSimple || !state.ok || !state.data || typeof state.data !== "object") {
			return;
		}
		const jobId = (state.data as { jobId?: string }).jobId;
		if (!jobId) return;
		setSubmittedJobId(jobId);
		setStepIndex(paymentStepIndex);
		toast.success(
			locale === "am"
				? "ማስታወቂያው ተቀምጧል። አሁን የክፍያ ዝርዝርዎን ያስገቡ።"
				: "Job saved. Add your payment details.",
		);
	}, [isSimple, state.ok, state.data, paymentStepIndex, locale]);

	const validateCurrentStep = useCallback(() => {
		if (!formRef.current || isReviewStep || isPaymentStep) return true;
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
	}, [stepIndex, isReviewStep, isPaymentStep]);

	const goNext = () => {
		if (!validateCurrentStep()) return;
		if (isLastInputStep && formRef.current) {
			setReviewData(
				Object.fromEntries(new FormData(formRef.current)) as ReviewSnapshot,
			);
		}
		setStepIndex((i) => Math.min(i + 1, steps.length - 1));
	};

	const goBack = () => {
		setStepErrors({});
		setStepIndex((i) => Math.max(i - 1, 0));
	};

	const mergedErrors = {
		...stepErrors,
		...(state.fieldErrors ?? {}),
	};

	const salaryCurrencies = [
		{
			value: "ETB",
			label: locale === "am" ? "ETB - የኢትዮጵያ ብር" : "ETB - Ethiopian Birr",
		},
		{
			value: "USD",
			label: locale === "am" ? "USD - የአሜሪካ ዶላር" : "USD - US Dollar",
		},
		{
			value: "EUR",
			label: locale === "am" ? "EUR - ዩሮ" : "EUR - Euro",
		},
	];

	if (isPaymentStep && submittedJobId) {
		return (
			<div className="space-y-6">
				<FormStepper
					steps={steps}
					stepIndex={stepIndex}
					ariaLabel="Job post progress"
				/>
				<PaymentForm
					jobId={submittedJobId}
					variant="single"
					successHref={`/post/${submittedJobId}/done`}
					cancelHref="/"
				/>
			</div>
		);
	}

	return (
		<form ref={formRef} action={action} noValidate className="space-y-6">
			{isSimple ? <input type="hidden" name="flow" value="simple" /> : null}
			<FormStepper
				steps={steps}
				stepIndex={stepIndex}
				onStepClick={submittedJobId ? undefined : setStepIndex}
				ariaLabel="Job post progress"
			/>

			<div className={cn(stepIndex !== 0 && "hidden")}>
				<div className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2">
						<Field
							label={tj("jobTitle")}
							name="title"
							error={mergedErrors.title?.[0]}
						>
							<Input
								name="title"
								placeholder={
									locale === "am"
										? "ለምሳሌ ሲኒየር የሶፍትዌር ኢንጂነር"
										: "Senior React Engineer"
								}
							/>
						</Field>
						<Field
							label={tj("companyName")}
							name="company"
							error={mergedErrors.company?.[0]}
						>
							<Input
								name="company"
								placeholder={
									locale === "am" ? "የድርጅትዎ ስም" : "Acme Corp"
								}
							/>
						</Field>
					</div>
					<Field
						label={tj("descriptionLabel")}
						name="description"
						error={mergedErrors.description?.[0]}
						helperText={
							locale === "am"
								? "ቢያንስ 10 ፊደላት መያዝ አለበት።"
								: "Min 10 characters. Markdown not yet supported."
						}
					>
						<Textarea
							name="description"
							rows={8}
							placeholder={
								locale === "am"
									? "ኃላፊነቶች፣ መስፈርቶች፣ ጥቅማጥቅሞች እና የስራው ዝርዝር ሁኔታ…"
									: "Tell candidates what they'll be doing, who you are, and what success looks like."
							}
						/>
					</Field>
				</div>
			</div>

			<div className={cn(stepIndex !== 1 && "hidden")}>
				<div className="grid gap-4 md:grid-cols-3">
					<Field
						label={tj("category")}
						name="categoryId"
						error={mergedErrors.categoryId?.[0]}
					>
						<Select name="categoryId">
							<SelectTrigger>
								<SelectValue
									placeholder={
										locale === "am" ? "ዘርፍ ይምረጡ..." : "Choose..."
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{categories.map((c) => (
									<SelectItem key={c.id} value={c.id}>
										{c.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
					<Field
						label={tj("employmentType")}
						name="employmentType"
						error={mergedErrors.employmentType?.[0]}
					>
						<Select name="employmentType" defaultValue="full_time">
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="full_time">
									{locale === "am" ? "ሙሉ ጊዜ (Full time)" : "Full time"}
								</SelectItem>
								<SelectItem value="part_time">
									{locale === "am" ? "የትርፍ ሰዓት (Part time)" : "Part time"}
								</SelectItem>
								<SelectItem value="contract">
									{locale === "am" ? "የኮንትራት (Contract)" : "Contract"}
								</SelectItem>
								<SelectItem value="internship">
									{locale === "am" ? "የልምምድ (Internship)" : "Internship"}
								</SelectItem>
								<SelectItem value="remote">
									{locale === "am" ? "የርቀት ስራ (Remote)" : "Remote"}
								</SelectItem>
							</SelectContent>
						</Select>
					</Field>
					<Field
						label={tj("location")}
						name="location"
						error={mergedErrors.location?.[0]}
					>
						<Select name="location" defaultValue="Addis Ababa">
							<SelectTrigger>
								<SelectValue
									placeholder={
										locale === "am" ? "የስራ ቦታ ይምረጡ" : "Choose location"
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{ETHIOPIA_LOCATION_OPTIONS.map((loc) => (
									<SelectItem key={loc.value} value={loc.value}>
										{locale === "am" ? loc.labelAm : loc.labelEn}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
				</div>
			</div>

			<div className={cn(stepIndex !== 2 && "hidden")}>
				<div className="space-y-4">
					<p className="text-sm text-muted-foreground">
						{locale === "am"
							? "አማራጭ፤ አመልካቾች የስራውን ክፍያ እንዲረዱ ያግዛል።"
							: "Optional, helps candidates understand your offer."}
					</p>
					<div className="grid gap-4 md:grid-cols-3">
						<Field label={tj("salaryMin")} name="salaryMin">
							<Input
								name="salaryMin"
								type="number"
								min={0}
								placeholder="15000"
							/>
						</Field>
						<Field label={tj("salaryMax")} name="salaryMax">
							<Input
								name="salaryMax"
								type="number"
								min={0}
								placeholder="25000"
							/>
						</Field>
						<Field label={tj("currency")} name="salaryCurrency">
							<Select name="salaryCurrency" defaultValue="ETB">
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{salaryCurrencies.map((currency) => (
										<SelectItem key={currency.value} value={currency.value}>
											{currency.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
					</div>
				</div>
			</div>

			<div className={cn(stepIndex !== 3 && "hidden")}>
				<div className="space-y-6">
					<Field
						label={tj("applyUrl")}
						name="applyUrl"
						helperText={
							locale === "am"
								? "አመልካቾች የት ማመልከት አለባቸው? የማመልከቻ ድረ-ገጽ ከሌለ አድራሻ መሙላት ይችላሉ።"
								: "Where should candidates apply? Optional if you fill contact info instead."
						}
						error={mergedErrors.applyUrl?.[0]}
					>
						<Input
							name="applyUrl"
							type="url"
							placeholder="https://yoursite.com/apply"
						/>
					</Field>
					<Field
						label={
							locale === "am"
								? "የማመልከቻ አድራሻ (አማራጭ)"
								: "Contact info (optional)"
						}
						name="contactInfo"
						helperText={
							locale === "am"
								? "ኢሜይል፣ የቴሌግራም መለያ ወይም የማመልከቻ ድረ-ገጽ ከሌለ ዝርዝር መመሪያ ያስገቡ።"
								: "Email, Telegram handle, or instructions if no application URL."
						}
					>
						<Textarea name="contactInfo" rows={2} />
					</Field>
					<FileUploader
						kind="logo"
						name="logoKey"
						label={
							locale === "am"
								? "የድርጅት አርማ (አማራጭ)"
								: "Company logo (optional)"
						}
						helperText="PNG, JPG, WebP, or SVG. Max 2 MB."
					/>
				</div>
			</div>

			<div className={cn(stepIndex !== 4 && "hidden")}>
				{reviewData ? (
					<div className="space-y-4 rounded-xl border bg-muted/20 p-4 sm:p-5">
						<h3 className="font-semibold">
							{locale === "am"
								? "የስራ ማስታወቂያዎን ይገምግሙ"
								: "Review your job post"}
						</h3>
						<dl className="grid gap-3 text-sm sm:grid-cols-2">
							<ReviewItem label={tj("jobTitle")} value={reviewData.title} />
							<ReviewItem label={tj("companyName")} value={reviewData.company} />
							<ReviewItem label={tj("category")} value={categoryName} />
							<ReviewItem
								label={tj("employmentType")}
								value={statusLabel(reviewData.employmentType, locale)}
							/>
							<ReviewItem
								label={tj("location")}
								value={formatLocation(reviewData.location, locale)}
							/>
							<ReviewItem
								label={tj("salary")}
								value={
									reviewData.salaryMin || reviewData.salaryMax
										? [
												reviewData.salaryMin,
												reviewData.salaryMax,
												reviewData.salaryCurrency ?? "ETB",
											]
												.filter(Boolean)
												.join(" – ")
										: tj("salaryNotSpecified")
								}
							/>
							<ReviewItem
								label={tj("applyUrl")}
								value={reviewData.applyUrl || "—"}
								className="sm:col-span-2"
							/>
							<ReviewItem
								label={tj("contact")}
								value={reviewData.contactInfo || "—"}
								className="sm:col-span-2"
							/>
						</dl>
						<div>
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								{tj("descriptionLabel")}
							</p>
							<p className="mt-1 whitespace-pre-wrap text-sm">
								{reviewData.description}
							</p>
						</div>
						{reviewData?.logoKey && (
							<p className="text-sm text-muted-foreground">
								{locale === "am"
									? "የድርጅት አርማ ተያይዟል።"
									: "Company logo attached."}
							</p>
						)}
					</div>
				) : (
					<p className="text-sm text-muted-foreground">
						{locale === "am"
							? "የቀደሙትን ደረጃዎች ሞልተው ሲጨርሱ ማጠቃለያው እዚህ ይታያል።"
							: "Complete the previous steps to review your submission."}
					</p>
				)}
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
						if (stepIndex !== 0) {
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
					{stepIndex === 0 ? tc("cancel") : tc("back")}
				</Button>
				{isReviewStep ? (
					<Button type="submit" disabled={pending || !reviewData}>
						{pending
							? locale === "am"
								? "በማስቀመጥ ላይ..."
								: "Saving..."
							: isSimple
								? locale === "am"
									? "ወደ ክፍያ ይቀጥሉ"
									: "Continue to payment"
								: locale === "am"
									? "አቅርበው ወደ ክፍያ ይቀጥሉ"
									: "Submit & continue to payment"}
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

function ReviewItem({
	label,
	value,
	className,
}: {
	label: string;
	value: string;
	className?: string;
}) {
	return (
		<div className={className}>
			<dt className="text-xs text-muted-foreground">{label}</dt>
			<dd className="mt-0.5 font-medium">{value}</dd>
		</div>
	);
}

function Field(props: {
	label: string;
	name: string;
	helperText?: string;
	error?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1.5">
			<Label htmlFor={props.name}>{props.label}</Label>
			{props.children}
			{props.helperText && !props.error && (
				<p className="text-xs text-muted-foreground">{props.helperText}</p>
			)}
			{props.error && <p className="text-xs text-destructive">{props.error}</p>}
		</div>
	);
}
