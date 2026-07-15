import Link from "next/link";
import { History, Search, Sparkles } from "lucide-react";
import { JobsBrowseCard } from "@/components/jobs/jobs-browse-card";
import { JobsFilterSidebar } from "@/components/jobs/jobs-filter-sidebar";
import { jobRepo } from "@/server/repositories/job";
import { categoryRepo } from "@/server/repositories/category";
import { env } from "@/lib/env";
import type { Job } from "@/server/db/schema";

export const metadata = {
	title: "Browse jobs",
	description: "Browse the latest job listings.",
};

interface SearchParams {
	q?: string;
	category?: string;
	type?: string;
	experience?: string;
	salary?: string;
	budget?: string;
	page?: string;
}

function salaryBounds(sp: SearchParams): {
	salaryMin?: number;
	salaryMax?: number;
} {
	if (sp.salary === "under_100") return { salaryMax: 100 };
	if (sp.salary === "100_1k") return { salaryMin: 100, salaryMax: 1000 };
	if (sp.salary === "1k_5k") return { salaryMin: 1000, salaryMax: 5000 };
	if (sp.budget) {
		const n = Number(sp.budget);
		if (Number.isFinite(n) && n > 0) return { salaryMax: n * 100 };
	}
	return {};
}

const EMPLOYMENT_TYPES = new Set<Job["employmentType"]>([
	"full_time",
	"part_time",
	"contract",
	"internship",
	"remote",
]);

export default async function JobsPage(props: {
	searchParams: Promise<SearchParams>;
}) {
	const sp = await props.searchParams;
	const page = Math.max(1, Number(sp.page ?? "1"));
	const pageSize = 12;
	const offset = (page - 1) * pageSize;
	const appName = env.NEXT_PUBLIC_APP_NAME;

	const categories = await categoryRepo.list();
	const category = sp.category
		? categories.find((c) => c.slug === sp.category)
		: null;

	const employmentType =
		sp.type && EMPLOYMENT_TYPES.has(sp.type as Job["employmentType"])
			? (sp.type as Job["employmentType"])
			: undefined;

	const { salaryMin, salaryMax } = salaryBounds(sp);

	const rows = await jobRepo.listPublic({
		limit: pageSize,
		offset,
		q: sp.q || undefined,
		categoryId: category?.id,
		employmentType,
		salaryMin,
		salaryMax,
	});

	const filterValues = {
		q: sp.q,
		category: sp.category,
		type: sp.type,
		experience: sp.experience,
		salary: sp.salary,
		budget: sp.budget,
	};

	const queryForPage = (nextPage: number) => {
		const params = new URLSearchParams();
		if (sp.q) params.set("q", sp.q);
		if (sp.category) params.set("category", sp.category);
		if (sp.type) params.set("type", sp.type);
		if (sp.experience) params.set("experience", sp.experience);
		if (sp.salary) params.set("salary", sp.salary);
		if (sp.budget) params.set("budget", sp.budget);
		if (nextPage > 1) params.set("page", String(nextPage));
		const qs = params.toString();
		return qs ? `/jobs?${qs}` : "/jobs";
	};

	return (
		<div className="min-h-[70vh] shell-canvas pt-24 pb-8 md:pt-28 md:pb-10">
			<div className="container mx-auto px-4">
				<div className="grid items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
					<JobsFilterSidebar
						categories={categories.map((c) => ({
							slug: c.slug,
							name: c.name,
						}))}
						values={filterValues}
					/>

					<div className="min-w-0 space-y-5">
						<section className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-7 shadow-sm sm:px-8 sm:py-8">
							<div className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-primary/10 to-primary/15" />
							<div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_70%_40%,color-mix(in_oklab,var(--primary)_20%,transparent),transparent_60%)]" />
							<div className="pointer-events-none absolute right-10 top-6 text-primary/40">
								<Sparkles className="size-5" />
							</div>
							<div className="pointer-events-none absolute bottom-8 right-24 text-primary/25">
								<Sparkles className="size-4" />
							</div>
							<div className="relative max-w-xl">
								<h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
									Find your dream job here
								</h1>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
									Join {appName} — a place where you find your dream job across
									many skills, with trusted employers and clear posting.
								</p>
							</div>
						</section>

						<form
							action="/jobs"
							method="get"
							className="flex flex-col gap-3 sm:flex-row sm:items-center"
						>
							{sp.category ? (
								<input type="hidden" name="category" value={sp.category} />
							) : null}
							{sp.type ? <input type="hidden" name="type" value={sp.type} /> : null}
							{sp.salary ? (
								<input type="hidden" name="salary" value={sp.salary} />
							) : null}
							{sp.budget ? (
								<input type="hidden" name="budget" value={sp.budget} />
							) : null}
							{sp.experience ? (
								<input type="hidden" name="experience" value={sp.experience} />
							) : null}

							<div className="relative min-w-0 flex-1">
								<Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
								<input
									name="q"
									defaultValue={sp.q ?? ""}
									placeholder="Search your job"
									className="h-12 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
								/>
							</div>
							<button
								type="submit"
								className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
							>
								Search
							</button>
							<Link
								href="/jobs"
								aria-label="Clear filters"
								className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-primary"
							>
								<History className="size-5" />
							</Link>
						</form>

						{rows.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
								No jobs match your filters yet.
							</div>
						) : (
							<div className="grid gap-4 sm:grid-cols-2">
								{rows.map(({ job, category: cat }) => (
									<JobsBrowseCard key={job.id} job={job} category={cat} />
								))}
							</div>
						)}

						<div className="flex items-center justify-between pt-2">
							{page > 1 ? (
								<Link
									href={queryForPage(page - 1)}
									className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-muted"
								>
									← Previous
								</Link>
							) : (
								<span />
							)}
							{rows.length === pageSize ? (
								<Link
									href={queryForPage(page + 1)}
									className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-muted"
								>
									Next →
								</Link>
							) : (
								<span />
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
