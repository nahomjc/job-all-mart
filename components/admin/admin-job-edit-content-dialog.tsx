"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateJobContentAction } from "@/server/actions/admin";

export type AdminEditableCategory = {
	id: string;
	name: string;
};

export type AdminJobEditValues = {
	jobId: string;
	title: string;
	company: string;
	description: string;
	categoryId: string | null;
	employmentType: string;
	location: string;
	salaryMin: number | null;
	salaryMax: number | null;
	salaryCurrency: string | null;
	applyUrl: string | null;
	contactInfo: string | null;
	logoUrl: string | null;
};

type AdminJobEditContentDialogProps = AdminJobEditValues & {
	categories: AdminEditableCategory[];
	triggerClassName?: string;
	triggerLabel?: string;
};

const EMPLOYMENT_TYPES = [
	{ value: "full_time", label: "Full time" },
	{ value: "part_time", label: "Part time" },
	{ value: "contract", label: "Contract" },
	{ value: "internship", label: "Internship" },
	{ value: "remote", label: "Remote" },
] as const;

export function AdminJobEditContentDialog({
	jobId,
	title,
	company,
	description,
	categoryId,
	employmentType,
	location,
	salaryMin,
	salaryMax,
	salaryCurrency,
	applyUrl,
	contactInfo,
	logoUrl,
	categories,
	triggerClassName,
	triggerLabel = "Edit job details",
}: AdminJobEditContentDialogProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [pending, startTransition] = useTransition();
	const [draft, setDraft] = useState(() => ({
		title,
		company,
		description,
		categoryId: categoryId ?? categories[0]?.id ?? "",
		employmentType,
		location,
		salaryMin: salaryMin?.toString() ?? "",
		salaryMax: salaryMax?.toString() ?? "",
		salaryCurrency: salaryCurrency ?? "ETB",
		applyUrl: applyUrl ?? "",
		contactInfo: contactInfo ?? "",
		clearLogo: false,
	}));

	const resetDraft = () => {
		setDraft({
			title,
			company,
			description,
			categoryId: categoryId ?? categories[0]?.id ?? "",
			employmentType,
			location,
			salaryMin: salaryMin?.toString() ?? "",
			salaryMax: salaryMax?.toString() ?? "",
			salaryCurrency: salaryCurrency ?? "ETB",
			applyUrl: applyUrl ?? "",
			contactInfo: contactInfo ?? "",
			clearLogo: false,
		});
	};

	const onOpenChange = (next: boolean) => {
		if (pending) return;
		if (next) resetDraft();
		setOpen(next);
	};

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		startTransition(async () => {
			const result = await updateJobContentAction({ ok: false }, formData);
			if (result.ok) {
				toast.success("Job details updated");
				setOpen(false);
				router.refresh();
			} else {
				toast.error(result.error ?? "Failed to update job");
			}
		});
	};

	const fieldId = (name: string) => `edit-job-${name}-${jobId}`;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className={triggerClassName ?? "h-11 w-full shrink-0 sm:w-auto"}
				>
					<Pencil className="size-4" />
					{triggerLabel}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Edit job details</DialogTitle>
					<DialogDescription>
						Update listing fields shown on the site and used when publishing to
						Telegram.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className="space-y-4">
					<input type="hidden" name="jobId" value={jobId} />

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2 sm:col-span-2">
							<Label htmlFor={fieldId("title")}>Title</Label>
							<Input
								id={fieldId("title")}
								name="title"
								value={draft.title}
								onChange={(e) =>
									setDraft((d) => ({ ...d, title: e.target.value }))
								}
								maxLength={200}
								required
								disabled={pending}
								className="h-11"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={fieldId("company")}>Company</Label>
							<Input
								id={fieldId("company")}
								name="company"
								value={draft.company}
								onChange={(e) =>
									setDraft((d) => ({ ...d, company: e.target.value }))
								}
								maxLength={200}
								required
								disabled={pending}
								className="h-11"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={fieldId("categoryId")}>Category</Label>
							<select
								id={fieldId("categoryId")}
								name="categoryId"
								value={draft.categoryId}
								onChange={(e) =>
									setDraft((d) => ({ ...d, categoryId: e.target.value }))
								}
								required
								disabled={pending}
								className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
							>
								{categories.map((c) => (
									<option key={c.id} value={c.id}>
										{c.name}
									</option>
								))}
							</select>
						</div>

						<div className="space-y-2">
							<Label htmlFor={fieldId("employmentType")}>Employment type</Label>
							<select
								id={fieldId("employmentType")}
								name="employmentType"
								value={draft.employmentType}
								onChange={(e) =>
									setDraft((d) => ({ ...d, employmentType: e.target.value }))
								}
								disabled={pending}
								className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
							>
								{EMPLOYMENT_TYPES.map((t) => (
									<option key={t.value} value={t.value}>
										{t.label}
									</option>
								))}
							</select>
						</div>

						<div className="space-y-2">
							<Label htmlFor={fieldId("location")}>Location</Label>
							<Input
								id={fieldId("location")}
								name="location"
								value={draft.location}
								onChange={(e) =>
									setDraft((d) => ({ ...d, location: e.target.value }))
								}
								maxLength={200}
								required
								disabled={pending}
								className="h-11"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={fieldId("salaryMin")}>Salary min (ETB)</Label>
							<Input
								id={fieldId("salaryMin")}
								name="salaryMin"
								type="number"
								min={0}
								inputMode="numeric"
								value={draft.salaryMin}
								onChange={(e) =>
									setDraft((d) => ({ ...d, salaryMin: e.target.value }))
								}
								placeholder="Optional"
								disabled={pending}
								className="h-11"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={fieldId("salaryMax")}>Salary max (ETB)</Label>
							<Input
								id={fieldId("salaryMax")}
								name="salaryMax"
								type="number"
								min={0}
								inputMode="numeric"
								value={draft.salaryMax}
								onChange={(e) =>
									setDraft((d) => ({ ...d, salaryMax: e.target.value }))
								}
								placeholder="Optional"
								disabled={pending}
								className="h-11"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={fieldId("salaryCurrency")}>Currency</Label>
							<Input
								id={fieldId("salaryCurrency")}
								name="salaryCurrency"
								value={draft.salaryCurrency}
								onChange={(e) =>
									setDraft((d) => ({ ...d, salaryCurrency: e.target.value }))
								}
								maxLength={8}
								disabled={pending}
								className="h-11"
							/>
						</div>

						<div className="space-y-2 sm:col-span-2">
							<Label htmlFor={fieldId("applyUrl")}>Apply URL</Label>
							<Input
								id={fieldId("applyUrl")}
								name="applyUrl"
								type="url"
								value={draft.applyUrl}
								onChange={(e) =>
									setDraft((d) => ({ ...d, applyUrl: e.target.value }))
								}
								placeholder="https://…"
								disabled={pending}
								className="h-11"
							/>
						</div>

						<div className="space-y-2 sm:col-span-2">
							<Label htmlFor={fieldId("contactInfo")}>Contact info</Label>
							<Textarea
								id={fieldId("contactInfo")}
								name="contactInfo"
								value={draft.contactInfo}
								onChange={(e) =>
									setDraft((d) => ({ ...d, contactInfo: e.target.value }))
								}
								rows={2}
								disabled={pending}
								className="resize-y"
							/>
						</div>

						<div className="space-y-2 sm:col-span-2">
							<Label htmlFor={fieldId("description")}>Description</Label>
							<Textarea
								id={fieldId("description")}
								name="description"
								value={draft.description}
								onChange={(e) =>
									setDraft((d) => ({ ...d, description: e.target.value }))
								}
								rows={8}
								required
								disabled={pending}
								className="min-h-40 resize-y"
							/>
						</div>

						<div className="space-y-3 sm:col-span-2">
							{logoUrl && !draft.clearLogo ? (
								<div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
									<Image
										src={logoUrl}
										alt={company}
										width={48}
										height={48}
										className="size-12 rounded-lg object-cover"
									/>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium">Current logo</p>
										<label className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
											<input
												type="checkbox"
												checked={draft.clearLogo}
												onChange={(e) =>
													setDraft((d) => ({
														...d,
														clearLogo: e.target.checked,
													}))
												}
												disabled={pending}
											/>
											Remove logo
										</label>
									</div>
								</div>
							) : null}
							{draft.clearLogo ? (
								<>
									<input type="hidden" name="clearLogo" value="on" />
									<div className="flex items-center justify-between rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
										<span>Logo will be removed on save.</span>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											disabled={pending}
											onClick={() =>
												setDraft((d) => ({ ...d, clearLogo: false }))
											}
										>
											Undo
										</Button>
									</div>
								</>
							) : (
								<FileUploader
									kind="logo"
									name="logoKey"
									label="Replace company logo (optional)"
									helperText="PNG, JPG, WebP, or SVG. Max 2 MB. Leave empty to keep the current logo."
								/>
							)}
						</div>
					</div>

					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={pending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={pending || categories.length === 0}>
							{pending ? "Saving…" : "Save changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
