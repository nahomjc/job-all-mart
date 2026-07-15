"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
	ArrowRight,
	BadgeCheck,
	Briefcase,
	MapPin,
	MessageSquare,
	Shield,
	Users,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE, MotionBlock, MotionSection } from "@/components/home/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS: {
	n: string;
	icon: LucideIcon;
	title: string;
	body: string;
	screen: "publish" | "reach" | "close";
}[] = [
	{
		n: "01",
		icon: Briefcase,
		title: "Publish your job",
		body: "Write the role, submit it for review, and go live on the web and Telegram.",
		screen: "publish",
	},
	{
		n: "02",
		icon: Users,
		title: "Shown to job seekers",
		body: "People find jobs through search, categories, and Telegram channels.",
		screen: "reach",
	},
	{
		n: "03",
		icon: Shield,
		title: "Payment and spam checks",
		body: "We verify payment and remove spam before anything goes live.",
		screen: "close",
	},
];

export function PipelineSection() {
	const reduce = useReducedMotion();
	const [active, setActive] = useState(0);
	const [paused, setPaused] = useState(false);

	useEffect(() => {
		if (reduce || paused) return;
		const id = window.setInterval(() => {
			setActive((i) => (i + 1) % STEPS.length);
		}, 4500);
		return () => window.clearInterval(id);
	}, [reduce, paused]);

	const step = STEPS[active];

	return (
		<MotionSection className="relative overflow-hidden py-20 md:py-24">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_55%_at_80%_40%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_70%)]"
			/>

			<div className="container mx-auto px-4">
				<div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
					<div>
						<MotionBlock variant="fadeUp">
							<p className="text-sm font-semibold uppercase tracking-wider text-primary">
								For employers
							</p>
							<h2 className="mt-3 text-balance text-3xl font-bold tracking-tight md:text-4xl">
								What you get
							</h2>
							<p className="mt-4 max-w-md text-pretty text-muted-foreground">
								Post once. Show up on the website and Telegram. We handle review.
							</p>
						</MotionBlock>

						<ul className="mt-8 space-y-2">
							{STEPS.map((item, i) => {
								const Icon = item.icon;
								const selected = i === active;
								return (
									<li key={item.n}>
										<button
											type="button"
											onClick={() => setActive(i)}
											onMouseEnter={() => setPaused(true)}
											onMouseLeave={() => setPaused(false)}
											className={cn(
												"flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition",
												selected
													? "border-primary/30 bg-primary/10 shadow-sm"
													: "border-transparent hover:bg-muted/60",
											)}
										>
											<span
												className={cn(
													"mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
													selected
														? "bg-primary text-primary-foreground"
														: "bg-muted text-muted-foreground",
												)}
											>
												{item.n}
											</span>
											<span className="min-w-0 flex-1">
												<span className="flex items-center gap-2 text-sm font-semibold text-foreground">
													<Icon className="size-3.5 shrink-0 text-primary" />
													{item.title}
												</span>
												<span className="mt-1 block text-sm text-muted-foreground">
													{item.body}
												</span>
											</span>
										</button>
									</li>
								);
							})}
						</ul>

						<div className="mt-8">
							<Button asChild className="h-12 rounded-full px-8" size="lg">
								<Link href="/login?mode=signup">
									Start hiring <ArrowRight className="size-4" />
								</Link>
							</Button>
						</div>
					</div>

					<div
						className="relative mx-auto w-full max-w-[320px]"
						onMouseEnter={() => setPaused(true)}
						onMouseLeave={() => setPaused(false)}
					>
						<motion.div
							aria-hidden
							animate={
								reduce
									? undefined
									: { scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }
							}
							transition={{
								duration: 5,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
							}}
							className="pointer-events-none absolute left-1/2 top-1/2 size-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-3xl"
						/>

						{/* floating chips */}
						<motion.div
							className="absolute -left-6 top-16 z-20 hidden rounded-2xl border border-border/70 bg-card px-3 py-2 shadow-lg sm:block"
							animate={reduce ? undefined : { y: [0, -8, 0] }}
							transition={{
								duration: 4,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
							}}
						>
							<p className="text-[10px] font-semibold text-muted-foreground">
								Status
							</p>
							<p className="text-xs font-bold text-primary">{step.n} · Live</p>
						</motion.div>
						<motion.div
							className="absolute -right-4 bottom-28 z-20 hidden rounded-2xl border border-border/70 bg-card px-3 py-2 shadow-lg sm:flex sm:items-center sm:gap-2"
							animate={reduce ? undefined : { y: [0, 10, 0] }}
							transition={{
								duration: 4.6,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
								delay: 0.4,
							}}
						>
							<span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary">
								<BadgeCheck className="size-3.5" />
							</span>
							<span className="text-xs font-semibold">Verified</span>
						</motion.div>

						{/* iPhone shell */}
						<motion.div
							initial={reduce ? false : { opacity: 0, y: 28 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.7, ease: EASE }}
							className="relative z-10"
						>
							<div className="rounded-[2.6rem] border-[3px] border-zinc-800 bg-zinc-900 p-2.5 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.55)] dark:border-zinc-700">
								<div className="relative overflow-hidden rounded-[2.15rem] bg-background">
									{/* Dynamic Island */}
									<div className="absolute left-1/2 top-3 z-30 h-[22px] w-[96px] -translate-x-1/2 rounded-full bg-zinc-950" />

									<div className="aspect-9/19 pt-10">
										<AnimatePresence mode="wait">
											<motion.div
												key={step.screen}
												initial={
													reduce ? { opacity: 1 } : { opacity: 0, y: 24 }
												}
												animate={{ opacity: 1, y: 0 }}
												exit={
													reduce ? { opacity: 0 } : { opacity: 0, y: -18 }
												}
												transition={{ duration: 0.4, ease: EASE }}
												className="flex h-full flex-col px-4 pb-5"
											>
												<PhoneScreen kind={step.screen} />
											</motion.div>
										</AnimatePresence>
									</div>
								</div>
							</div>
						</motion.div>

						{/* progress dots */}
						<div className="mt-6 flex justify-center gap-2">
							{STEPS.map((s, i) => (
								<button
									key={s.n}
									type="button"
									aria-label={`Show step ${s.n}`}
									onClick={() => setActive(i)}
									className={cn(
										"h-1.5 rounded-full transition-all",
										i === active ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30",
									)}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</MotionSection>
	);
}

function PhoneScreen({ kind }: { kind: "publish" | "reach" | "close" }) {
	if (kind === "publish") {
		return (
			<>
				<p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
					New job
				</p>
				<p className="mt-1 text-base font-bold text-foreground">Post a role</p>
				<div className="mt-4 space-y-2.5">
					<div className="rounded-xl border border-border bg-card p-3">
						<p className="text-[10px] text-muted-foreground">Title</p>
						<p className="text-sm font-medium">Senior Designer</p>
					</div>
					<div className="rounded-xl border border-border bg-card p-3">
						<p className="text-[10px] text-muted-foreground">Company</p>
						<p className="text-sm font-medium">Nova Labs</p>
					</div>
					<div className="flex items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-3 text-sm text-primary">
						<Briefcase className="size-4" />
						Ready for review
					</div>
				</div>
				<div className="mt-auto rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground">
					Submit listing
				</div>
			</>
		);
	}

	if (kind === "reach") {
		return (
			<>
				<p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
					Discovery
				</p>
				<p className="mt-1 text-base font-bold text-foreground">Candidates</p>
				<div className="mt-4 space-y-2.5">
					{[
						{ name: "Telegram channel", meta: "84 viewing", icon: MessageSquare },
						{ name: "Web browse", meta: "Category: Design", icon: MapPin },
						{ name: "Search hits", meta: "+26 today", icon: Users },
					].map((row) => {
						const Icon = row.icon;
						return (
							<div
								key={row.name}
								className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
							>
								<span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<Icon className="size-3.5" />
								</span>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium">{row.name}</p>
									<p className="text-[11px] text-muted-foreground">{row.meta}</p>
								</div>
							</div>
						);
					})}
				</div>
				<div className="mt-auto flex items-center justify-between rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-xs">
					<span className="text-muted-foreground">Reach today</span>
					<span className="font-bold text-primary">+110</span>
				</div>
			</>
		);
	}

	return (
		<>
			<p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
				Trust
			</p>
			<p className="mt-1 text-base font-bold text-foreground">Protected hire</p>
			<div className="mt-4 space-y-2.5">
				<div className="rounded-xl border border-primary/25 bg-primary/10 p-3">
					<div className="flex items-center gap-2 text-primary">
						<BadgeCheck className="size-4" />
						<span className="text-sm font-semibold">Payment verified</span>
					</div>
					<p className="mt-1 text-[11px] text-muted-foreground">
						Proof approved by admin
					</p>
				</div>
				<div className="rounded-xl border border-border bg-card p-3">
					<div className="flex items-center gap-2">
						<Shield className="size-4 text-primary" />
						<span className="text-sm font-medium">Spam filter clear</span>
					</div>
				</div>
				<div className="rounded-xl border border-border bg-card p-3">
					<div className="flex items-center gap-2">
						<Users className="size-4 text-primary" />
						<span className="text-sm font-medium">Human-reviewed</span>
					</div>
				</div>
			</div>
			<div className="mt-auto rounded-xl bg-brand-deep py-2.5 text-center text-sm font-semibold text-white">
				Ready to close
			</div>
		</>
	);
}
