"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
	BadgeCheck,
	CheckCircle2,
	Shield,
	Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE, MotionBlock, MotionSection } from "@/components/home/motion";
import { cn } from "@/lib/utils";

const SLIDES: {
	icon: LucideIcon;
	title: string;
	body: string;
	screenTitle: string;
	rows: string[];
}[] = [
	{
		icon: Shield,
		title: "Reviewed by people",
		body: "An admin looks at every post before it is published.",
		screenTitle: "Review queue",
		rows: ["Spam check passed", "Admin assigned", "Awaiting approval"],
	},
	{
		icon: CheckCircle2,
		title: "Payment confirmed",
		body: "Jobs go live only after payment proof is approved.",
		screenTitle: "Payment proof",
		rows: ["Screenshot uploaded", "Reference matched", "Marked verified"],
	},
	{
		icon: Zap,
		title: "Goes to Telegram quickly",
		body: "Approved jobs are sent to the matching channel topic.",
		screenTitle: "Published",
		rows: ["Posted to board", "Sent to Telegram", "Listed for seekers"],
	},
];

export function WhyUsSection() {
	const reduce = useReducedMotion();
	const [active, setActive] = useState(0);
	const [paused, setPaused] = useState(false);

	useEffect(() => {
		if (reduce || paused) return;
		const id = window.setInterval(() => {
			setActive((i) => (i + 1) % SLIDES.length);
		}, 4200);
		return () => window.clearInterval(id);
	}, [reduce, paused]);

	const slide = SLIDES[active];

	return (
		<MotionSection className="container mx-auto px-4 py-20 md:py-24">
			<div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
				<div>
					<MotionBlock variant="fadeUp">
						<p className="text-sm font-semibold uppercase tracking-wider text-primary">
							Why us
						</p>
						<h2 className="mt-2 text-balance text-3xl font-bold tracking-tight md:text-4xl">
							Checked before it goes live
						</h2>
						<p className="mt-3 max-w-md text-muted-foreground">
							Every job is reviewed and payment-checked by a person first.
						</p>
					</MotionBlock>

					<ul className="mt-8 space-y-2">
						{SLIDES.map((item, i) => {
							const Icon = item.icon;
							const selected = i === active;
							return (
								<li key={item.title}>
									<button
										type="button"
										onClick={() => setActive(i)}
										onMouseEnter={() => setPaused(true)}
										onMouseLeave={() => setPaused(false)}
										className={cn(
											"flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition",
											selected
												? "border-primary/30 bg-primary/10"
												: "border-transparent hover:bg-muted/60",
										)}
									>
										<span
											className={cn(
												"mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
												selected
													? "bg-primary text-primary-foreground"
													: "bg-muted text-muted-foreground",
											)}
										>
											<Icon className="size-4" />
										</span>
										<span>
											<span className="block text-sm font-semibold text-foreground">
												{item.title}
											</span>
											<span className="mt-0.5 block text-sm text-muted-foreground">
												{item.body}
											</span>
										</span>
									</button>
								</li>
							);
						})}
					</ul>
				</div>

				<div
					className="mx-auto w-full max-w-lg"
					onMouseEnter={() => setPaused(true)}
					onMouseLeave={() => setPaused(false)}
				>
					{/* iMac shell */}
					<div className="relative">
						<div className="rounded-[1.35rem] border border-zinc-300 bg-linear-to-b from-zinc-200 to-zinc-300 p-[10px] shadow-[0_30px_60px_-28px_rgba(15,23,42,0.55)] dark:border-zinc-700 dark:from-zinc-700 dark:to-zinc-800">
							<div className="relative overflow-hidden rounded-[0.95rem] bg-zinc-950 ring-1 ring-black/40">
								{/* camera */}
								<span className="absolute left-1/2 top-2 z-20 size-1.5 -translate-x-1/2 rounded-full bg-zinc-700" />

								<div className="aspect-16/10 bg-background">
									<AnimatePresence mode="wait">
										<motion.div
											key={slide.title}
											initial={
												reduce
													? { opacity: 1 }
													: { opacity: 0, x: 36 }
											}
											animate={{ opacity: 1, x: 0 }}
											exit={
												reduce
													? { opacity: 0 }
													: { opacity: 0, x: -28 }
											}
											transition={{ duration: 0.4, ease: EASE }}
											className="flex h-full flex-col p-4 sm:p-5"
										>
											<div className="flex items-center justify-between gap-2 border-b border-border pb-3">
												<div>
													<p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
														Dashboard
													</p>
													<p className="text-sm font-semibold text-foreground">
														{slide.screenTitle}
													</p>
												</div>
												<span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
													<BadgeCheck className="size-4" />
												</span>
											</div>

											<ul className="mt-4 space-y-2.5">
												{slide.rows.map((row, i) => (
													<li
														key={row}
														className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-3 py-2.5"
													>
														<span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
															{i + 1}
														</span>
														<span className="text-sm text-foreground/90">
															{row}
														</span>
														<CheckCircle2 className="ml-auto size-4 text-primary" />
													</li>
												))}
											</ul>

											<div className="mt-auto flex gap-1.5 pt-4">
												{SLIDES.map((_, i) => (
													<span
														key={SLIDES[i].title}
														className={cn(
															"h-1 flex-1 rounded-full transition-colors",
															i === active ? "bg-primary" : "bg-muted",
														)}
													/>
												))}
											</div>
										</motion.div>
									</AnimatePresence>
								</div>
							</div>

							{/* chin / logo notch */}
							<div className="flex h-7 items-center justify-center sm:h-8">
								<span className="size-2.5 rounded-full bg-zinc-400/80 dark:bg-zinc-500" />
							</div>
						</div>

						{/* neck */}
						<div className="mx-auto h-10 w-[4.5rem] bg-linear-to-b from-zinc-300 to-zinc-400 dark:from-zinc-600 dark:to-zinc-700 sm:h-12" />
						{/* foot */}
						<div className="mx-auto h-2.5 w-40 rounded-t-full bg-linear-to-b from-zinc-300 to-zinc-400 shadow-md dark:from-zinc-600 dark:to-zinc-700 sm:w-48" />
					</div>
				</div>
			</div>
		</MotionSection>
	);
}
