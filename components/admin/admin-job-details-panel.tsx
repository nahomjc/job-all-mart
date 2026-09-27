"use client";

import type { LucideIcon } from "lucide-react";
import { Briefcase, Building2, Calendar, ExternalLink, MapPin } from "lucide-react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { AdminJobEditContentDialog } from "@/components/admin/admin-job-edit-content-dialog";
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
	categoryName: string;
	logoUrl: string | null;
	employmentType: string;
	location: string;
	salaryMin: number | null;
	salaryMax: number | null;
	salaryCurrency: string | null;
	createdAt: Date;
	applyUrl: string | null;
	description: string;
};

export function AdminJobDetailsPanel({
	jobId,
	title,
	company,
	categoryName,
	logoUrl,
	employmentType,
	location,
	salaryMin,
	salaryMax,
	salaryCurrency,
	createdAt,
	applyUrl,
	description,
}: AdminJobDetailsPanelProps) {
	const rawLocale = useLocale();
	const locale: FormatLocale = rawLocale === "am" ? "am" : "en";
	const isAm = locale === "am";

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
					jobId={jobId}
					title={title}
					description={description}
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

			<div className="min-w-0">
				<p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
					{isAm ? "ዝርዝር ማብራሪያ" : "Description"}
				</p>
				<div className="mt-2 max-w-full overflow-hidden rounded-xl border bg-muted/20 p-3 text-sm leading-relaxed break-words whitespace-pre-line sm:mt-3 sm:p-4">
					{description}
				</div>
			</div>
		</div>
	);
}

function DetailItem({
	label,
	value,
	icon: Icon,
	className,
}: {
	label: string;
	value: React.ReactNode;
	icon?: LucideIcon;
	className?: string;
}) {
	return (
		<div className={cn("min-w-0", className)}>
			<p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
				{Icon && <Icon className="size-3.5 shrink-0" />}
				{label}
			</p>
			<div className="mt-1 break-words text-sm font-medium sm:mt-1.5">{value}</div>
		</div>
	);
}
