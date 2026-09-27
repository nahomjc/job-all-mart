"use client";

import type { LucideIcon } from "lucide-react";
import { Briefcase, Building2, Calendar, ExternalLink, MapPin } from "lucide-react";
import Image from "next/image";
import { useLocale } from "next-intl";
import {
	AdminJobEditContentDialog,
	type AdminEditableCategory,
} from "@/components/admin/admin-job-edit-content-dialog";
import { Separator } from "@/components/ui/separator";
import {
	formatLocation,
	formatRelativeTime,
	formatSalary,
	statusLabel,
	type FormatLocale,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export type AdminJobDetailsPanelProps = {
	jobId: string;
	title: string;
	company: string;
	categoryId: string | null;
	categoryName: string;
	categories: AdminEditableCategory[];
	logoUrl: string | null;
	employmentType: string;
	location: string;
	salaryMin: number | null;
	salaryMax: number | null;
	salaryCurrency: string | null;
	createdAt: Date;
	applyUrl: string | null;
	contactInfo: string | null;
	description: string;
};

export function AdminJobDetailsPanel({
	jobId,
	title,
	company,
	categoryId,
	categoryName,
	categories,
	logoUrl,
	employmentType,
	location,
	salaryMin,
	salaryMax,
	salaryCurrency,
	createdAt,
	applyUrl,
	contactInfo,
	description,
}: AdminJobDetailsPanelProps) {
	const rawLocale = useLocale();
	const locale: FormatLocale = rawLocale === "am" ? "am" : "en";
	const isAm = locale === "am";

	const editProps = {
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
	};

	return (
		<div className="min-w-0 space-y-4 sm:space-y-6">
			<div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex min-w-0 flex-1 items-start gap-3 rounded-xl border bg-muted/20 p-3 sm:gap-4 sm:p-4">
					<div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-background sm:size-14">
						{logoUrl ? (
							<Image
								src={logoUrl}
								alt={company}
								width={56}
								height={56}
								className="size-full rounded-xl object-cover"
							/>
						) : (
							<Building2 className="size-6 text-muted-foreground" />
						)}
					</div>
					<div className="min-w-0">
						<p className="font-semibold leading-snug">{title}</p>
						<p className="mt-0.5 text-sm text-muted-foreground">
							{company} · {categoryName}
						</p>
					</div>
				</div>
				<AdminJobEditContentDialog
					{...editProps}
					triggerLabel={isAm ? "አስተካክል" : "Edit"}
					triggerClassName="h-10 w-full shrink-0 gap-1.5 px-3 sm:w-auto"
				/>
			</div>

			<div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
				<DetailItem
					icon={Briefcase}
					label={isAm ? "የስራ አይነት" : "Employment type"}
					value={statusLabel(employmentType, locale)}
				/>
				<DetailItem
					icon={MapPin}
					label={isAm ? "የስራ ቦታ" : "Location"}
					value={formatLocation(location, locale)}
				/>
				<DetailItem
					label={isAm ? "ደመወዝ" : "Salary"}
					value={formatSalary(salaryMin, salaryMax, salaryCurrency, { locale })}
				/>
				<DetailItem
					icon={Calendar}
					label={isAm ? "የቀረበበት" : "Submitted"}
					value={formatRelativeTime(createdAt, locale)}
				/>
				{applyUrl && (
					<DetailItem
						label={isAm ? "የማመልከቻ ሊንክ" : "Apply link"}
						value={
							<a
								href={applyUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex max-w-full min-w-0 items-start gap-1 break-all text-primary hover:underline sm:items-center"
							>
								<span className="min-w-0">{applyUrl}</span>
								<ExternalLink className="mt-0.5 size-3.5 shrink-0 sm:mt-0" />
							</a>
						}
						className="min-[480px]:col-span-2"
					/>
				)}
			</div>

			<Separator />

			<div>
				<h3 className="mb-2 text-sm font-semibold">
					{isAm ? "መግለጫ" : "Description"}
				</h3>
				<div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
					{description}
				</div>
			</div>
		</div>
	);
}

function DetailItem({
	icon: Icon,
	label,
	value,
	className,
}: {
	icon?: LucideIcon;
	label: string;
	value: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("min-w-0 space-y-1", className)}>
			<p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
				{Icon ? <Icon className="size-3.5 shrink-0" /> : null}
				{label}
			</p>
			<div className="text-sm font-medium">{value}</div>
		</div>
	);
}
