"use client";

import { useRouter } from "next/navigation";
import {
	useCallback,
	useEffect,
	useState,
	useTransition,
	type CSSProperties,
} from "react";
import { cn } from "@/lib/utils";

type CategoryOption = { slug: string; name: string };

const JOB_TYPES = [
	{ value: "full_time", label: "Full-time" },
	{ value: "contract", label: "Freelance" },
	{ value: "internship", label: "Internship" },
	{ value: "part_time", label: "Part-time" },
] as const;

const EXPERIENCE = [
	{ value: "entry", label: "Entry level" },
	{ value: "intermediate", label: "intermediate" },
	{ value: "expert", label: "Expert" },
] as const;

const SALARY_PRESETS = [
	{ value: "under_100", label: "Under $100", max: 100 },
	{ value: "100_1k", label: "$100 to $1K", min: 100, max: 1000 },
	{ value: "1k_5k", label: "$1K to $5K", min: 1000, max: 5000 },
	{ value: "hourly", label: "Hourly", hourly: true },
] as const;

export type JobsFilterValues = {
	q?: string;
	category?: string;
	type?: string;
	experience?: string;
	salary?: string;
	budget?: string;
};

type JobsFilterSidebarProps = {
	categories: CategoryOption[];
	values: JobsFilterValues;
};

function FilterCheck({
	checked,
	label,
	onChange,
}: {
	checked: boolean;
	label: string;
	onChange: () => void;
}) {
	return (
		<label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-foreground/80">
			<input
				type="checkbox"
				checked={checked}
				onChange={onChange}
				className="peer sr-only"
			/>
			<span
				aria-hidden
				className={cn(
					"flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors",
					checked
						? "border-primary bg-primary text-primary-foreground"
						: "border-border bg-card",
				)}
			>
				{checked ? (
					<svg viewBox="0 0 12 12" className="size-3" aria-hidden="true">
						<title>Checked</title>
						<path
							d="M2.5 6.2 5 8.7 9.5 3.5"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				) : null}
			</span>
			<span className="leading-none">{label}</span>
		</label>
	);
}

export function JobsFilterSidebar({ categories, values }: JobsFilterSidebarProps) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [budget, setBudget] = useState(Number(values.budget ?? "60") || 60);

	useEffect(() => {
		setBudget(Number(values.budget ?? "60") || 60);
	}, [values.budget]);

	const push = useCallback(
		(next: Partial<JobsFilterValues> & { clear?: (keyof JobsFilterValues)[] }) => {
			const { clear = [], ...patch } = next;
			const merged: JobsFilterValues = {
				q: values.q,
				category: values.category,
				type: values.type,
				experience: values.experience,
				salary: values.salary,
				budget: values.budget,
				...patch,
			};

			for (const key of clear) {
				delete merged[key];
			}

			const params = new URLSearchParams();
			if (merged.q) params.set("q", merged.q);
			if (merged.category) params.set("category", merged.category);
			if (merged.type) params.set("type", merged.type);
			if (merged.experience) params.set("experience", merged.experience);
			if (merged.salary) params.set("salary", merged.salary);
			if (merged.budget) params.set("budget", merged.budget);

			const qs = params.toString();
			startTransition(() => {
				router.push(qs ? `/jobs?${qs}` : "/jobs");
			});
		},
		[router, values],
	);

	return (
		<aside
			className={cn(
				"rounded-2xl border border-border/70 bg-card p-5 shadow-sm",
				pending && "opacity-80",
			)}
		>
			<h2 className="text-lg font-bold tracking-tight text-foreground">Filter</h2>

			<div className="mt-5 space-y-5">
				<div>
					<label
						htmlFor="jobs-category"
						className="mb-2 block text-[13px] font-semibold text-foreground"
					>
						Category
					</label>
					<div className="relative">
						<select
							id="jobs-category"
							value={values.category ?? ""}
							onChange={(e) =>
								push({
									category: e.target.value || undefined,
									clear: e.target.value ? [] : ["category"],
								})
							}
							className="h-11 w-full appearance-none rounded-xl border border-border bg-card px-3 pr-9 text-[13px] text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
						>
							<option value="">All categories</option>
							{categories.map((c) => (
								<option key={c.slug} value={c.slug}>
									{c.name}
								</option>
							))}
						</select>
						<svg
							className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							aria-hidden="true"
						>
							<title>Open</title>
							<path d="m6 9 6 6 6-6" />
						</svg>
					</div>
				</div>

				<div>
					<p className="mb-3 text-[13px] font-semibold text-foreground">Job Type</p>
					<div className="grid grid-cols-2 gap-x-3 gap-y-3">
						{JOB_TYPES.map((t) => (
							<FilterCheck
								key={t.value}
								label={t.label}
								checked={values.type === t.value}
								onChange={() =>
									push(
										values.type === t.value
											? { clear: ["type"] }
											: { type: t.value },
									)
								}
							/>
						))}
					</div>
				</div>

				<div>
					<p className="mb-3 text-[13px] font-semibold text-foreground">
						Experience level
					</p>
					<div className="grid grid-cols-2 gap-x-3 gap-y-3">
						{EXPERIENCE.map((t) => (
							<FilterCheck
								key={t.value}
								label={t.label}
								checked={values.experience === t.value}
								onChange={() =>
									push(
										values.experience === t.value
											? { clear: ["experience"] }
											: { experience: t.value },
									)
								}
							/>
						))}
					</div>
				</div>

				<div>
					<p className="mb-3 text-[13px] font-semibold text-foreground">
						Expected salary
					</p>
					<div className="grid grid-cols-2 gap-x-3 gap-y-3">
						{SALARY_PRESETS.map((t) => (
							<FilterCheck
								key={t.value}
								label={t.label}
								checked={values.salary === t.value}
								onChange={() =>
									push(
										values.salary === t.value
											? { clear: ["salary"] }
											: { salary: t.value, clear: ["budget"] },
									)
								}
							/>
						))}
					</div>

					<div className="relative mt-6 px-1 pb-6">
						<input
							type="range"
							min={10}
							max={100}
							step={1}
							value={budget}
							onChange={(e) => setBudget(Number(e.target.value))}
							onMouseUp={() => push({ budget: String(budget), clear: ["salary"] })}
							onTouchEnd={() => push({ budget: String(budget), clear: ["salary"] })}
							className="jobs-budget-slider w-full"
							style={
								{
									"--budget-pct": `${((budget - 10) / 90) * 100}%`,
								} as CSSProperties
							}
							aria-label="Budget filter"
						/>
						<div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
							<span>$10</span>
							<span>$100</span>
						</div>
						<div
							className="pointer-events-none absolute top-[26px] -translate-x-1/2 rounded-md bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground shadow-sm"
							style={{
								left: `${((budget - 10) / 90) * 100}%`,
							}}
						>
							${budget}
						</div>
					</div>
				</div>
			</div>
		</aside>
	);
}
