"use client";

import Image from "next/image";
import { CheckCircle2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import {
	EASE,
	MotionBlock,
	MotionSection,
	Stagger,
	StaggerChild,
} from "@/components/home/motion";

const STEPS = [
	{
		n: "01",
		title: "Search and Apply",
		body: "Browse thousands of job opportunities that match your skills and interests.",
	},
	{
		n: "02",
		title: "Connect and Interview",
		body: "Once accepted, connect directly with recruiters or employers to schedule.",
	},
	{
		n: "03",
		title: "Grow Your Career",
		body: "Land your dream job and keep growing with new opportunities.",
	},
] as const;

function FloatingCard({
	children,
	className,
	delay = 0,
}: {
	children: React.ReactNode;
	className: string;
	delay?: number;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.6, ease: EASE }}
			className={className}
		>
			<motion.div
				animate={{ y: [0, -8, 0] }}
				transition={{
					duration: 4 + delay,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
				}}
			>
				{children}
			</motion.div>
		</motion.div>
	);
}

export function HowItWorksSection({ appName }: { appName: string }) {
	return (
		<MotionSection className="container mx-auto px-4 py-24">
			<div className="grid gap-14 lg:grid-cols-2 lg:items-center">
				<MotionBlock variant="slideLeft" className="relative mx-auto h-[460px] w-full max-w-md">
					<motion.div
						animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
						transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
						className="absolute -left-6 -top-6 size-32 rounded-3xl bg-amber-100/70 blur-2xl"
					/>
					<motion.div
						animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
						transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
						className="absolute -bottom-6 -right-6 size-40 rounded-3xl bg-primary/25 blur-2xl"
					/>
					<motion.div
						whileHover={{ scale: 1.02 }}
						transition={{ type: "spring", stiffness: 300 }}
						className="relative h-full w-full overflow-hidden rounded-[2.5rem] shadow-2xl shadow-black/15 ring-1 ring-border/50"
					>
						<Image
							src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=900&q=80"
							alt="Professional working at her desk"
							fill
							sizes="(min-width: 1024px) 448px, 100vw"
							className="object-cover"
						/>
					</motion.div>

					<FloatingCard
						delay={0.2}
						className="absolute -left-4 bottom-10 flex items-center gap-3 rounded-2xl border bg-background p-3 pr-5 shadow-xl"
					>
						<span className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
							<TrendingUp className="size-5" />
						</span>
						<div>
							<p className="text-base font-bold leading-none">12,567</p>
							<p className="mt-1 text-xs text-muted-foreground">
								Views <span className="font-medium text-sky-600">+50%</span>
							</p>
						</div>
					</FloatingCard>

					<FloatingCard
						delay={0.5}
						className="absolute -right-3 top-10 flex items-center gap-3 rounded-2xl border bg-background p-3 pr-5 shadow-xl"
					>
						<span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
							<CheckCircle2 className="size-5" />
						</span>
						<div>
							<p className="text-base font-bold leading-none">98%</p>
							<p className="mt-1 text-xs text-muted-foreground">Successful hires</p>
						</div>
					</FloatingCard>
				</MotionBlock>

				<MotionBlock variant="slideRight">
					<p className="text-sm font-semibold uppercase tracking-wider text-primary">
						How it works
					</p>
					<h2 className="mt-2 text-balance text-3xl font-bold tracking-tight md:text-4xl">
						How {appName} works
					</h2>
					<p className="mt-3 max-w-md text-pretty text-muted-foreground">
						From finding the right job to connecting with employers—everything
						happens in just a few easy steps.
					</p>

					<Stagger className="relative mt-10 space-y-6">
						<motion.span
							initial={{ scaleY: 0 }}
							whileInView={{ scaleY: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.8, ease: EASE }}
							className="absolute left-7 top-8 bottom-8 w-px origin-top border-l-2 border-dashed border-primary/40"
						/>
						{STEPS.map(({ n, title, body }) => (
							<StaggerChild key={n}>
								<motion.div
									whileHover={{ x: 6 }}
									className="relative flex items-start gap-5 rounded-2xl p-1"
								>
									<motion.span
										whileHover={{ scale: 1.08, rotate: 3 }}
										className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-xl border-2 border-primary bg-background text-lg font-bold text-primary shadow-sm"
									>
										{n}
									</motion.span>
									<div className="pt-1">
										<h3 className="font-semibold">{title}</h3>
										<p className="mt-1 max-w-md text-sm text-muted-foreground">
											{body}
										</p>
									</div>
								</motion.div>
							</StaggerChild>
						))}
					</Stagger>
				</MotionBlock>
			</div>
		</MotionSection>
	);
}
