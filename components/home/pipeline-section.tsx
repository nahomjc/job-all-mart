"use client";

import Link from "next/link";
import {
	ArrowRight,
	Briefcase,
	CheckCircle2,
	Handshake,
	Shield,
	Users,
} from "lucide-react";
import { motion } from "framer-motion";
import {
	EASE,
	MotionBlock,
	MotionSection,
	Stagger,
	StaggerChild,
	HoverLift,
} from "@/components/home/motion";
import { Button } from "@/components/ui/button";

export function PipelineSection() {
	return (
		<MotionSection className="relative py-24">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,var(--primary)/0.1,transparent_70%)]"
			/>
			<div className="container mx-auto px-4">
				<div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-end lg:gap-16">
					<MotionBlock variant="slideLeft" className="max-w-lg">
						<motion.p
							initial={{ opacity: 0, x: -20 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, ease: EASE }}
							className="text-sm font-semibold uppercase tracking-wider text-primary"
						>
							For employers & teams
						</motion.p>
						<h2 className="mt-3 text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-[2.75rem]">
							Build your pipeline in{" "}
							<span className="relative inline-block text-primary">
								three moves
								<motion.span
									initial={{ scaleX: 0 }}
									whileInView={{ scaleX: 1 }}
									viewport={{ once: true }}
									transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
									className="absolute -bottom-1 left-0 right-0 h-2.5 origin-left -skew-x-3 rounded-sm bg-primary/25"
								/>
							</span>
						</h2>
						<p className="mt-4 text-pretty text-lg text-muted-foreground">
							List on web and Telegram, reach candidates where they already
							are, and close hires with moderation you can trust.
						</p>
						<motion.div
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.98 }}
							className="mt-8 inline-block"
						>
							<Button asChild className="h-12 rounded-full px-8" size="lg">
								<Link href="/login?mode=signup">
									Start hiring <ArrowRight className="size-4" />
								</Link>
							</Button>
						</motion.div>
					</MotionBlock>

					<Stagger className="grid gap-4 sm:grid-cols-2">
						<StaggerChild className="sm:col-span-2">
							<HoverLift>
								<motion.div
									whileHover={{ boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)" }}
									className="relative overflow-hidden rounded-3xl bg-brand-deep p-6 text-primary-foreground shadow-xl shadow-brand-deep/30 sm:p-8"
								>
									<motion.span
										initial={{ opacity: 0, scale: 0.8 }}
										whileInView={{ opacity: 0.12, scale: 1 }}
										viewport={{ once: true }}
										transition={{ duration: 0.8 }}
										className="pointer-events-none absolute -right-4 -top-6 select-none font-black leading-none text-[7rem] sm:text-[8rem]"
									>
										01
									</motion.span>
									<div className="relative">
										<span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
											<Briefcase className="size-3.5" />
											Publish
										</span>
										<h3 className="mt-4 text-xl font-bold sm:text-2xl">
											Ship a listing before lunch
										</h3>
										<p className="mt-2 max-w-md text-sm leading-relaxed text-primary-foreground/85">
											Draft your role, pass a quick human review, and go live on
											the site plus our Telegram channel—applications start the
											same day.
										</p>
									</div>
								</motion.div>
							</HoverLift>
						</StaggerChild>

						<StaggerChild>
							<HoverLift>
								<div className="group relative h-full overflow-hidden rounded-3xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-xl">
									<span className="absolute right-3 top-2 font-mono text-5xl font-bold text-muted-foreground/15">
										02
									</span>
									<span className="flex size-11 items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary">
										<Users className="size-5" />
									</span>
									<h3 className="mt-4 font-semibold">Reach real people</h3>
									<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
										Candidates discover you on search, categories, and
										Telegram—not buried in a spreadsheet.
									</p>
									<motion.div
										className="absolute inset-x-0 bottom-0 h-1 bg-primary"
										initial={{ scaleX: 0 }}
										whileInView={{ scaleX: 1 }}
										viewport={{ once: true }}
										transition={{ delay: 0.2, duration: 0.5 }}
									/>
								</div>
							</HoverLift>
						</StaggerChild>

						<StaggerChild>
							<HoverLift>
								<div className="group relative h-full overflow-hidden rounded-3xl border bg-muted/50 p-6 backdrop-blur-sm">
									<span className="absolute right-3 top-2 font-mono text-5xl font-bold text-muted-foreground/15">
										03
									</span>
									<span className="flex size-11 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
										<Shield className="size-5" />
									</span>
									<h3 className="mt-4 font-semibold">Close with confidence</h3>
									<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
										Payments stay protected; suspicious listings get flagged
										before they waste anyone&apos;s time.
									</p>
									<div className="mt-4 flex flex-wrap gap-2">
										<span className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-xs font-medium">
											<CheckCircle2 className="size-3 text-primary" />
											Human-reviewed
										</span>
										<span className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-xs font-medium">
											<Handshake className="size-3 text-primary" />
											Verified hires
										</span>
									</div>
								</div>
							</HoverLift>
						</StaggerChild>
					</Stagger>
				</div>
			</div>
		</MotionSection>
	);
}
