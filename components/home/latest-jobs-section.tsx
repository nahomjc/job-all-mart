"use client";

import Image from "next/image";
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
import { FeaturedJobCard } from "@/components/jobs/featured-job-card";
import type { Category, Job } from "@/server/db/schema";

type JobRow = { job: Job; category: Category | null };

export function LatestJobsSection({ jobs }: { jobs: JobRow[] }) {
	return (
		<MotionSection className="relative overflow-hidden py-24 text-primary-foreground">
			{/* Full-bleed workplace background */}
			<Image
				src="/images/featured-jobs-bg.jpg"
				alt=""
				fill
				priority={false}
				sizes="100vw"
				className="object-cover object-center"
			/>
			{/* Brand-tinted scrim so white cards + copy stay readable */}
			<div
				aria-hidden
				className="absolute inset-0 bg-brand-deep/78"
			/>
			<div
				aria-hidden
				className="absolute inset-0 bg-linear-to-b from-brand-deep/55 via-brand-deep/70 to-brand-deep/85"
			/>

			<div className="container relative z-10 mx-auto px-4">
				<div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
					<MotionBlock variant="fadeUp">
						<p className="text-sm font-semibold uppercase tracking-wider text-sky-200">
							Featured jobs
						</p>
						<h2 className="mt-2 text-balance text-3xl font-bold tracking-tight md:text-4xl">
							Roles worth opening first
						</h2>
						<p className="mt-2 max-w-xl text-primary-foreground/75">
							Pinned openings from verified employers — built for clarity, not
							clutter.
						</p>
					</MotionBlock>
					<motion.div
						initial={{ opacity: 0, y: 8 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.45, ease: EASE }}
					>
						<Button
							asChild
							variant="outline"
							className="rounded-full border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
						>
							<Link href="/jobs">
								See all jobs <ArrowRight className="size-4" />
							</Link>
						</Button>
					</motion.div>
				</div>

				{jobs.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-white/20 bg-white/10 px-6 py-16 text-center text-sm text-primary-foreground/70 backdrop-blur-sm">
						No jobs posted yet — be the first.
					</div>
				) : (
					<Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
						{jobs.map(({ job, category }) => (
							<StaggerChild key={job.id}>
								<FeaturedJobCard job={job} category={category} />
							</StaggerChild>
						))}
					</Stagger>
				)}
			</div>
		</MotionSection>
	);
}
