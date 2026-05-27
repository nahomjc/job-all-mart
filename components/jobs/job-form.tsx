"use client";

import { FileUploader } from "@/components/file-uploader";
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
import { type ActionState, submitJobAction } from "@/server/actions/jobs";
import type { Category } from "@/server/db/schema";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";

const initial: ActionState = { ok: false };

interface JobFormProps {
	categories: Pick<Category, "id" | "name">[];
}

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

export function JobForm({ categories }: JobFormProps) {
	const router = useRouter();
	const [state, action, pending] = useActionState(submitJobAction, initial);

	if (state.ok) {
		toast.success("Submitted! Now upload payment proof.");
	} else if (state.error && !state.fieldErrors) {
		toast.error(state.error);
	}

	return (
		<form action={action} className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2">
				<Field
					label="Job title"
					name="title"
					error={state.fieldErrors?.title?.[0]}
				>
					<Input name="title" placeholder="Senior React Engineer" required />
				</Field>
				<Field
					label="Company"
					name="company"
					error={state.fieldErrors?.company?.[0]}
				>
					<Input name="company" placeholder="Acme Corp" required />
				</Field>
			</div>

			<Field
				label="Job description"
				name="description"
				error={state.fieldErrors?.description?.[0]}
				helperText="Min 80 characters. Markdown not yet supported."
			>
				<Textarea
					name="description"
					rows={8}
					placeholder="Tell candidates what they'll be doing, who you are, and what success looks like."
					required
					minLength={80}
				/>
			</Field>

			<div className="grid gap-4 md:grid-cols-3">
				<Field
					label="Category"
					name="categoryId"
					error={state.fieldErrors?.categoryId?.[0]}
				>
					<Select name="categoryId" required>
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
					error={state.fieldErrors?.employmentType?.[0]}
				>
					<Select name="employmentType" defaultValue="full_time" required>
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
					error={state.fieldErrors?.location?.[0]}
				>
					<Select name="location" defaultValue="Addis Ababa" required>
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

			<div className="grid gap-4 md:grid-cols-3">
				<Field label="Salary min" name="salaryMin">
					<Input name="salaryMin" type="number" min={0} placeholder="1500" />
				</Field>
				<Field label="Salary max" name="salaryMax">
					<Input name="salaryMax" type="number" min={0} placeholder="2500" />
				</Field>
				<Field label="Currency" name="salaryCurrency">
					<Select name="salaryCurrency" defaultValue="ETB" required>
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

			<Field
				label="Application URL"
				name="applyUrl"
				helperText="Where should candidates apply? Optional if you fill contact info instead."
				error={state.fieldErrors?.applyUrl?.[0]}
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
					{pending ? "Submitting..." : "Submit & continue to payment"}
				</Button>
			</div>
		</form>
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
