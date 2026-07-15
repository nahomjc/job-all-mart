"use client";

import Link from "next/link";
import {
	ArrowRight,
	BadgeCheck,
	Briefcase,
	CheckCircle2,
	CreditCard,
	FileText,
	MessageSquare,
	Send,
	Shield,
	Upload,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE, MotionBlock, MotionSection } from "@/components/home/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
	{
		n: "01",
		title: "Create your account",
		body: "Sign up on the web or start from Telegram. Link your channel so posts reach the right audience.",
	},
	{
		n: "02",
		title: "Post job details",
		body: "Add title, company, location, salary, and a clear description in a guided form.",
	},
	{
		n: "03",
		title: "Upload payment proof",
		body: "Attach your transfer screenshot so our team can verify and move you into review.",
	},
	{
		n: "04",
		title: "Go live on Telegram",
		body: "Once approved, your listing is published to the board and broadcast to seekers.",
	},
] as const;

export function HowItWorksSection({ appName }: { appName: string }) {
	const reduce = useReducedMotion();

	return (
		<MotionSection className="container mx-auto px-4 py-20 md:py-24">
			<div className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-brand-deep text-primary-foreground shadow-xl shadow-black/10">
				<div className="border-b border-white/10 px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
					<MotionBlock>
						<span className="inline-flex items-center rounded-md border border-primary/50 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
							How it works
						</span>
						<h2 className="mt-4 max-w-2xl text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
							From draft to Telegram — four clear steps on {appName}
						</h2>
						<p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
							Post once, get reviewed, and reach job seekers without juggling
							multiple tools.
						</p>
					</MotionBlock>
				</div>

				<div className="grid lg:grid-cols-3">
					{/* Step 1 — full height left */}
					<StepCell className="border-b border-white/10 lg:border-b-0 lg:border-r">
						<StepCopy step={STEPS[0]} />
						<HubVisual reduce={!!reduce} />
					</StepCell>

					{/* Steps 2 + 3 — stacked middle */}
					<div className="flex flex-col border-b border-white/10 lg:border-b-0 lg:border-r">
						<StepCell className="flex-1 border-b border-white/10">
							<OverviewVisual reduce={!!reduce} />
							<StepCopy step={STEPS[1]} className="mt-5" />
						</StepCell>
						<StepCell className="flex-1">
							<UploadVisual />
							<StepCopy step={STEPS[2]} className="mt-5" />
						</StepCell>
					</div>

					{/* Step 4 — full height right */}
					<StepCell>
						<StepCopy step={STEPS[3]} />
						<PublishVisual reduce={!!reduce} />
						<div className="mt-6">
							<Button
								asChild
								className="h-11 rounded-xl bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90"
							>
								<Link href="/login?mode=signup">
									Start posting
									<ArrowRight className="size-4" />
								</Link>
							</Button>
						</div>
					</StepCell>
				</div>
			</div>
		</MotionSection>
	);
}

function StepCell({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("flex flex-col p-6 sm:p-7 lg:p-8", className)}>
			{children}
		</div>
	);
}

function StepCopy({
	step,
	className,
}: {
	step: (typeof STEPS)[number];
	className?: string;
}) {
	return (
		<div className={className}>
			<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
				Step {step.n}
			</p>
			<h3 className="mt-2 text-lg font-semibold tracking-tight text-white sm:text-xl">
				{step.title}
			</h3>
			<p className="mt-2 text-sm leading-relaxed text-white/60">{step.body}</p>
		</div>
	);
}

function HubVisual({ reduce }: { reduce: boolean }) {
	const nodes = [
		{ icon: MessageSquare, label: "Telegram", x: "12%", y: "78%" },
		{ icon: Briefcase, label: "Web", x: "38%", y: "88%" },
		{ icon: Shield, label: "Review", x: "62%", y: "88%" },
		{ icon: Send, label: "Channel", x: "88%", y: "78%" },
	] as const;

	return (
		<div className="relative mt-8 min-h-[200px] flex-1">
			<svg
				className="absolute inset-0 size-full text-primary/35"
				aria-hidden="true"
			>
				{nodes.map((n) => (
					<line
						key={n.label}
						x1="50%"
						y1="42%"
						x2={n.x}
						y2={n.y}
						stroke="currentColor"
						strokeWidth="1"
						strokeDasharray="4 4"
					/>
				))}
			</svg>

			<motion.div
				className="absolute left-1/2 top-[34%] flex size-14 -translate-x-1/2 items-center justify-center rounded-full border border-primary/40 bg-primary/20 text-primary shadow-[0_0_32px_color-mix(in_oklab,var(--primary)_45%,transparent)]"
				animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
				transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
			>
				<BadgeCheck className="size-6" />
			</motion.div>

			{nodes.map((n, i) => {
				const Icon = n.icon;
				return (
					<motion.div
						key={n.label}
						initial={reduce ? false : { opacity: 0, y: 8 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.1 * i, duration: 0.45, ease: EASE }}
						className="absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/85 backdrop-blur-sm"
						style={{ left: n.x, top: n.y }}
						title={n.label}
					>
						<Icon className="size-4" />
					</motion.div>
				);
			})}
		</div>
	);
}

function OverviewVisual({ reduce }: { reduce: boolean }) {
	return (
		<div className="relative flex min-h-[120px] items-center justify-center">
			<div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_45%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_65%)]" />
			<motion.div
				className="relative z-10 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25"
				animate={reduce ? undefined : { y: [0, -4, 0] }}
				transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
			>
				<CheckCircle2 className="size-3.5" />
				In review
			</motion.div>
			<span className="absolute left-[18%] top-[28%] size-2 rounded-full bg-emerald-400/80" />
			<span className="absolute right-[22%] top-[34%] size-1.5 rounded-full bg-sky-300/80" />
			<span className="absolute bottom-[30%] left-[30%] size-1.5 rounded-full bg-amber-300/70" />
			<span className="absolute bottom-[26%] right-[28%] size-2 rounded-full bg-primary/70" />
		</div>
	);
}

function UploadVisual() {
	return (
		<div className="rounded-xl border border-white/12 bg-white/5 p-3 backdrop-blur-sm">
			<div className="flex items-center gap-3 rounded-lg border border-dashed border-white/20 bg-black/20 px-3 py-3">
				<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
					<Upload className="size-4" />
				</span>
				<div className="min-w-0 flex-1">
					<p className="truncate text-xs font-medium text-white">
						Upload payment proof
					</p>
					<p className="truncate text-[11px] text-white/45">PNG, JPG up to 5MB</p>
				</div>
				<span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-white/15 text-white/50">
					<CreditCard className="size-3.5" />
				</span>
			</div>
		</div>
	);
}

function PublishVisual({ reduce }: { reduce: boolean }) {
	const files = [0, 1, 2, 3, 4];

	return (
		<div className="relative mt-8 min-h-[180px] flex-1">
			<motion.div
				className="relative z-10 mx-auto w-fit rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30"
				initial={reduce ? false : { opacity: 0, y: 8 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.5, ease: EASE }}
			>
				<span className="inline-flex items-center gap-2">
					<Send className="size-3.5" />
					Publish to board
				</span>
			</motion.div>

			<svg className="absolute inset-0 size-full text-primary/30" aria-hidden="true">
				{files.map((i) => {
					const x = 18 + i * 16;
					return (
						<line
							key={i}
							x1="50%"
							y1="22%"
							x2={`${x}%`}
							y2="72%"
							stroke="currentColor"
							strokeWidth="1"
						/>
					);
				})}
			</svg>

			<div className="absolute inset-x-0 bottom-2 flex justify-center gap-3">
				{files.map((i) => (
					<motion.span
						key={i}
						initial={reduce ? false : { opacity: 0, y: 10 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.08 * i, duration: 0.4, ease: EASE }}
						className="flex size-10 items-center justify-center rounded-lg border border-white/12 bg-white/5 text-white/70"
					>
						<FileText className="size-4" />
					</motion.span>
				))}
			</div>
		</div>
	);
}
