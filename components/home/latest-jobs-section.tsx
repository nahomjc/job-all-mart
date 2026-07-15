"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import {
	EASE,
	MotionBlock,
	MotionSection,
	Stagger,
	StaggerChild,
} from "@/components/home/motion";
import { Button } from "@/components/ui/button";
import { JobsBrowseCard } from "@/components/jobs/jobs-browse-card";
import type { Category, Job } from "@/server/db/schema";

type JobRow = { job: Job; category: Category | null };

export function LatestJobsSection({ jobs }: { jobs: JobRow[] }) {
	return (
		<MotionSection className="shell-canvas py-24">
			<div className="container mx-auto px-4">
				<div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
					<MotionBlock variant="fadeUp">
						<p className="text-sm font-semibold uppercase tracking-wider text-primary">
							Latest opportunities
						</p>
						<h2 className="mt-2 text-balance text-3xl font-bold tracking-tight md:text-4xl">
							Fresh openings, posted today
						</h2>
						<p className="mt-2 max-w-xl text-muted-foreground">
							Hand-picked roles from verified employers across our channels.
						</p>
					</MotionBlock>
					<motion.div
						initial={{ opacity: 0, y: 8 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.45, ease: EASE }}
					>
						<Button asChild variant="outline" className="rounded-full">
							<Link href="/jobs">
								See all jobs <ArrowRight className="size-4" />
							</Link>
						</Button>
					</motion.div>
				</div>

				{jobs.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
						No jobs posted yet — be the first.
					</div>
				) : (
					<Stagger className="grid gap-4 sm:grid-cols-2">
						{jobs.map(({ job, category }) => (
							<StaggerChild key={job.id}>
								<JobsBrowseCard job={job} category={category} />
							</StaggerChild>
						))}
					</Stagger>
				)}
			</div>
		</MotionSection>
	);
}
