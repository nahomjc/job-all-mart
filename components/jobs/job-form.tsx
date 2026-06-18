"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { FileUploader } from "@/components/file-uploader";
import { FormStepper, type FormStep } from "@/components/form-stepper";
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
import { jobFormStepSchemas } from "@/lib/validations/job";
import { type ActionState, submitJobAction } from "@/server/actions/jobs";
import type { Category } from "@/server/db/schema";

const initial: ActionState = { ok: false };

const STEPS: FormStep[] = [
	{ id: "basics", title: "Job basics", short: "Basics" },
	{ id: "details", title: "Role details", short: "Details" },
	{ id: "compensation", title: "Compensation", short: "Pay" },
	{ id: "apply", title: "Apply & logo", short: "Apply" },
	{ id: "review", title: "Review & submit", short: "Review" },
];

const STEP_SCHEMAS = [
	jobFormStepSchemas.basics,
	jobFormStepSchemas.details,
	jobFormStepSchemas.compensation,
	jobFormStepSchemas.apply,
] as const;

const EMPLOYMENT_LABELS: Record<string, string> = {
	full_time: "Full time",
	part_time: "Part time",
	contract: "Contract",
	internship: "Internship",
	remote: "Remote",
};

const ETHIOPIA_LOCATIONS = [
	"Addis Ababa",
	"Adama",
	"Bahir Dar",
	"Hawassa",
	"Mekelle",
	"Dire Dawa",
	"Gondar",
	"Jimma",
	"Dessie",
	"Bishoftu",
	"Remote (Ethiopia)",
	"Hybrid (Addis Ababa)",
];

const SALARY_CURRENCIES = [
	{ value: "ETB", label: "ETB - Ethiopian Birr" },
	{ value: "USD", label: "USD - US Dollar" },
	{ value: "EUR", label: "EUR - Euro" },
];

interface JobFormProps {
	categories: Pick<Category, "id" | "name">[];
}

type ReviewSnapshot = Record<string, string>;

export function JobForm({ categories }: JobFormProps) {
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);
	const [stepIndex, setStepIndex] = useState(0);
	const [stepErrors, setStepErrors] = useState<Record<string, string[]>>({});
	const [reviewData, setReviewData] = useState<ReviewSnapshot | null>(null);
	const [state, action, pending] = useActionState(submitJobAction, initial);

	const isReviewStep = stepIndex === STEPS.length - 1;
	const isLastInputStep = stepIndex === STEPS.length - 2;

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

	const validateCurrentStep = useCallback(() => {
		if (!formRef.current || isReviewStep) return true;
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
	}, [stepIndex, isReviewStep]);

	const goNext = () => {
		if (!validateCurrentStep()) return;
		if (isLastInputStep && formRef.current) {
			setReviewData(
				Object.fromEntries(new FormData(formRef.current)) as ReviewSnapshot,
			);
		}
		setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
	};

	const goBack = () => {
		setStepErrors({});
		setStepIndex((i) => Math.max(i - 1, 0));
	};

	const mergedErrors = {
		...stepErrors,
		...(state.fieldErrors ?? {}),
	};

	return (
		<form ref={formRef} action={action} noValidate className="space-y-6">
			<FormStepper
				steps={STEPS}
				stepIndex={stepIndex}
				onStepClick={setStepIndex}
				ariaLabel="Job post progress"
			/>

			<div className={cn(stepIndex !== 0 && "hidden")}>
				<div className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2">
						<Field
							label="Job title"
							name="title"
							error={mergedErrors.title?.[0]}
						>
							<Input name="title" placeholder="Senior React Engineer" />
						</Field>
						<Field
							label="Company"
							name="company"
							error={mergedErrors.company?.[0]}
						>
							<Input name="company" placeholder="Acme Corp" />
						</Field>
					</div>
					<Field
						label="Job description"
						name="description"
						error={mergedErrors.description?.[0]}
						helperText="Min 80 characters. Markdown not yet supported."
					>
						<Textarea
							name="description"
							rows={8}
							placeholder="Tell candidates what they'll be doing, who you are, and what success looks like."
						/>
					</Field>
				</div>
			</div>

			<div className={cn(stepIndex !== 1 && "hidden")}>
				<div className="grid gap-4 md:grid-cols-3">
					<Field
						label="Category"
						name="categoryId"
						error={mergedErrors.categoryId?.[0]}
					>
						<Select name="categoryId">
							<SelectTrigger>
								<SelectValue placeholder="Choose..." />
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
						label="Employment type"
						name="employmentType"
						error={mergedErrors.employmentType?.[0]}
					>
						<Select name="employmentType" defaultValue="full_time">
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="full_time">Full time</SelectItem>
								<SelectItem value="part_time">Part time</SelectItem>
								<SelectItem value="contract">Contract</SelectItem>
								<SelectItem value="internship">Internship</SelectItem>
								<SelectItem value="remote">Remote</SelectItem>
							</SelectContent>
						</Select>
					</Field>
					<Field
						label="Location"
						name="location"
						error={mergedErrors.location?.[0]}
					>
						<Select name="location" defaultValue="Addis Ababa">
							<SelectTrigger>
								<SelectValue placeholder="Choose location" />
							</SelectTrigger>
							<SelectContent>
								{ETHIOPIA_LOCATIONS.map((location) => (
									<SelectItem key={location} value={location}>
										{location}
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
						Optional — helps candidates understand your offer.
					</p>
					<div className="grid gap-4 md:grid-cols-3">
						<Field label="Salary min" name="salaryMin">
							<Input
								name="salaryMin"
								type="number"
								min={0}
								placeholder="1500"
							/>
						</Field>
						<Field label="Salary max" name="salaryMax">
							<Input
								name="salaryMax"
								type="number"
								min={0}
								placeholder="2500"
							/>
						</Field>
						<Field label="Currency" name="salaryCurrency">
							<Select name="salaryCurrency" defaultValue="ETB">
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{SALARY_CURRENCIES.map((currency) => (
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
						label="Application URL"
						name="applyUrl"
						helperText="Where should candidates apply? Optional if you fill contact info instead."
						error={mergedErrors.applyUrl?.[0]}
					>
						<Input
							name="applyUrl"
							type="url"
							placeholder="https://yoursite.com/apply"
						/>
					</Field>
					<Field
						label="Contact info (optional)"
						name="contactInfo"
						helperText="Email, Telegram handle, or instructions if no application URL."
					>
						<Textarea name="contactInfo" rows={2} />
					</Field>
					<FileUploader
						kind="logo"
						name="logoKey"
						label="Company logo (optional)"
						helperText="PNG, JPG, WebP, or SVG. Max 2 MB."
					/>
				</div>
			</div>

			<div className={cn(stepIndex !== 4 && "hidden")}>
				{reviewData ? (
				<div className="space-y-4 rounded-xl border bg-muted/20 p-4 sm:p-5">
					<h3 className="font-semibold">Review your job post</h3>
					<dl className="grid gap-3 text-sm sm:grid-cols-2">
						<ReviewItem label="Title" value={reviewData.title} />
						<ReviewItem label="Company" value={reviewData.company} />
						<ReviewItem label="Category" value={categoryName} />
						<ReviewItem
							label="Employment"
							value={
								EMPLOYMENT_LABELS[reviewData.employmentType] ??
								reviewData.employmentType
							}
						/>
						<ReviewItem label="Location" value={reviewData.location} />
						<ReviewItem
							label="Salary"
							value={
								reviewData.salaryMin || reviewData.salaryMax
									? [
											reviewData.salaryMin,
											reviewData.salaryMax,
											reviewData.salaryCurrency ?? "ETB",
										]
											.filter(Boolean)
											.join(" – ")
									: "Not specified"
							}
						/>
						<ReviewItem
							label="Apply URL"
							value={reviewData.applyUrl || "—"}
							className="sm:col-span-2"
						/>
						<ReviewItem
							label="Contact"
							value={reviewData.contactInfo || "—"}
							className="sm:col-span-2"
						/>
					</dl>
					<div>
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Description
						</p>
						<p className="mt-1 whitespace-pre-wrap text-sm">
							{reviewData.description}
						</p>
					</div>
					{reviewData?.logoKey && (
						<p className="text-sm text-muted-foreground">
							Company logo attached.
						</p>
					)}
				</div>
				) : (
					<p className="text-sm text-muted-foreground">
						Complete the previous steps to review your submission.
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
					onClick={() => (stepIndex === 0 ? router.back() : goBack())}
				>
					{stepIndex === 0 ? "Cancel" : "Back"}
				</Button>
				{isReviewStep ? (
					<Button type="submit" disabled={pending || !reviewData}>
						{pending ? "Submitting..." : "Submit & continue to payment"}
					</Button>
				) : (
					<Button type="button" onClick={goNext}>
						Continue
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
