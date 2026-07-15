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
		body: "Sign up on the website or through Telegram.",
	},
	{
		n: "02",
		title: "Post job details",
		body: "Add the title, company, location, salary, and description.",
	},
	{
		n: "03",
		title: "Upload payment proof",
		body: "Send a screenshot of your payment so we can verify it.",
	},
	{
		n: "04",
		title: "Go live on Telegram",
		body: "After approval, your job goes live on the board and Telegram.",
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
							How posting works on {appName}
						</h2>
						<p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
							Sign up, add the job, pay, then we publish it to Telegram.
						</p>
					</MotionBlock>
				</div>

				<div className="grid lg:grid-cols-3">
					<StepCell className="border-b border-white/10 lg:border-b-0 lg:border-r">
						<StepCopy step={STEPS[0]} />
						<HubVisual reduce={!!reduce} />
					</StepCell>

					<div className="flex flex-col border-b border-white/10 lg:border-b-0 lg:border-r">
						<StepCell className="flex-1 border-b border-white/10">
							<OverviewVisual reduce={!!reduce} />
							<StepCopy step={STEPS[1]} className="mt-5" />
						</StepCell>
						<StepCell className="flex-1">
							<UploadVisual reduce={!!reduce} />
							<StepCopy step={STEPS[2]} className="mt-5" />
						</StepCell>
					</div>

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
		{ icon: MessageSquare, label: "Telegram", angle: 210 },
		{ icon: Briefcase, label: "Web", angle: 255 },
		{ icon: Shield, label: "Review", angle: 300 },
		{ icon: Send, label: "Channel", angle: 345 },
	] as const;

	const radius = 72;

	return (
		<div className="relative mx-auto mt-10 flex h-[220px] w-full max-w-[280px] items-center justify-center">
			{/* Soft scan ring */}
			{!reduce && (
				<motion.span
					aria-hidden
					className="absolute size-36 rounded-full border border-primary/30"
					animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0, 0.55] }}
					transition={{
						duration: 2.8,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeOut",
					}}
				/>
			)}
			<span
				aria-hidden
				className="absolute size-28 rounded-full border border-dashed border-white/15"
			/>

			{/* Orbiting connector dots */}
			{!reduce &&
				[0, 1, 2].map((i) => (
					<motion.span
						key={i}
						aria-hidden
						className="absolute size-1.5 rounded-full bg-sky-300"
						style={{ left: "50%", top: "50%" }}
						animate={{ rotate: 360 }}
						transition={{
							duration: 8 + i * 2,
							repeat: Number.POSITIVE_INFINITY,
							ease: "linear",
							delay: i * 0.4,
						}}
					>
						<span
							className="absolute block size-1.5 rounded-full bg-sky-300"
							style={{ transform: `translate(${40 + i * 10}px, -50%)` }}
						/>
					</motion.span>
				))}

			<motion.div
				className="relative z-10 flex size-16 items-center justify-center rounded-full border border-primary/50 bg-primary/25 text-primary shadow-[0_0_40px_color-mix(in_oklab,var(--primary)_40%,transparent)]"
				initial={reduce ? false : { scale: 0.7, opacity: 0 }}
				whileInView={{ scale: 1, opacity: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 0.55, ease: EASE }}
			>
				{!reduce && (
					<motion.span
						aria-hidden
						className="absolute inset-0 rounded-full bg-primary/20"
						animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
						transition={{
							duration: 2.2,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
					/>
				)}
				<BadgeCheck className="relative size-7" />
			</motion.div>

			{nodes.map((n, i) => {
				const Icon = n.icon;
				const rad = (n.angle * Math.PI) / 180;
				const x = Math.cos(rad) * radius;
				const y = Math.sin(rad) * radius;
				return (
					<motion.div
						key={n.label}
						initial={reduce ? false : { opacity: 0, scale: 0.5 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.15 + i * 0.12, duration: 0.45, ease: EASE }}
						className="absolute z-10 flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/8 text-white/90 shadow-lg backdrop-blur-sm"
						style={{
							left: `calc(50% + ${x}px)`,
							top: `calc(50% + ${y}px)`,
							transform: "translate(-50%, -50%)",
						}}
						title={n.label}
					>
						{!reduce && (
							<motion.span
								className="absolute inset-0 rounded-xl"
								animate={{ y: [0, -3, 0] }}
								transition={{
									duration: 2.4 + i * 0.25,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
									delay: i * 0.2,
								}}
							/>
						)}
						<Icon className="relative size-4" />
					</motion.div>
				);
			})}
		</div>
	);
}

function OverviewVisual({ reduce }: { reduce: boolean }) {
	return (
		<div className="relative overflow-hidden rounded-2xl border border-white/12 bg-black/25 p-4">
			<div className="mb-3 flex items-center gap-2">
				<span className="size-2 rounded-full bg-rose-400/80" />
				<span className="size-2 rounded-full bg-amber-300/80" />
				<span className="size-2 rounded-full bg-emerald-400/80" />
				<span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-white/40">
					Job draft
				</span>
			</div>

			<div className="space-y-2.5">
				{[
					{ id: "l1", w: 72 },
					{ id: "l2", w: 54 },
					{ id: "l3", w: 88 },
					{ id: "l4", w: 40 },
				].map((line, i) => (
					<motion.div
						key={line.id}
						className="h-2 origin-left rounded-full bg-white/15"
						style={{ width: `${line.w}%` }}
						initial={reduce ? false : { scaleX: 0, opacity: 0 }}
						whileInView={{ scaleX: 1, opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.1 + i * 0.12, duration: 0.55, ease: EASE }}
					/>
				))}
			</div>

			<motion.div
				className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground shadow-lg shadow-primary/25"
				initial={reduce ? false : { opacity: 0, y: 8 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ delay: 0.55, duration: 0.45, ease: EASE }}
			>
				{!reduce && (
					<motion.span
						animate={{ rotate: [0, 12, -8, 0] }}
						transition={{
							duration: 2.8,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
					>
						<CheckCircle2 className="size-3.5" />
					</motion.span>
				)}
				{reduce && <CheckCircle2 className="size-3.5" />}
				<span>Ready to submit</span>
			</motion.div>
		</div>
	);
}

function UploadVisual({ reduce }: { reduce: boolean }) {
	return (
		<div className="rounded-xl border border-white/12 bg-white/5 p-3 backdrop-blur-sm">
			<div className="relative flex items-center gap-3 overflow-hidden rounded-lg border border-dashed border-white/20 bg-black/20 px-3 py-3">
				{!reduce && (
					<motion.span
						aria-hidden
						className="pointer-events-none absolute inset-y-0 w-16 bg-linear-to-r from-transparent via-white/10 to-transparent"
						animate={{ x: ["-40%", "220%"] }}
						transition={{
							duration: 2.4,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
							repeatDelay: 1.2,
						}}
					/>
				)}

				<motion.span
					className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary"
					animate={reduce ? undefined : { y: [0, -4, 0] }}
					transition={{
						duration: 1.8,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				>
					<Upload className="size-4" />
				</motion.span>
				<div className="relative min-w-0 flex-1">
					<p className="truncate text-xs font-medium text-white">
						Upload payment proof
					</p>
					<div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
						<motion.div
							className="h-full rounded-full bg-primary"
							initial={reduce ? { width: "72%" } : { width: "0%" }}
							whileInView={{ width: "72%" }}
							viewport={{ once: true }}
							transition={{ delay: 0.2, duration: 1.1, ease: EASE }}
						/>
					</div>
					<p className="mt-1 truncate text-[11px] text-white/45">
						receipt.png · uploading…
					</p>
				</div>
				<span className="relative flex size-8 shrink-0 items-center justify-center rounded-md border border-white/15 text-white/50">
					<CreditCard className="size-3.5" />
				</span>
			</div>
		</div>
	);
}

function PublishVisual({ reduce }: { reduce: boolean }) {
	const targets = [
		{ id: "t1", x: 14 },
		{ id: "t2", x: 32 },
		{ id: "t3", x: 50 },
		{ id: "t4", x: 68 },
		{ id: "t5", x: 86 },
	];

	return (
		<div className="relative mt-8 min-h-[190px] flex-1">
			<svg className="absolute inset-0 size-full" aria-hidden="true">
				{targets.map((t, i) => (
					<motion.line
						key={t.id}
						x1="50%"
						y1="18%"
						x2={`${t.x}%`}
						y2="68%"
						stroke="rgb(125 211 252 / 0.35)"
						strokeWidth="1.5"
						strokeDasharray="5 6"
						initial={reduce ? false : { pathLength: 0, opacity: 0 }}
						whileInView={{ pathLength: 1, opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.15 + i * 0.08, duration: 0.6, ease: EASE }}
					/>
				))}
			</svg>

			{!reduce &&
				targets.map((t, i) => (
					<motion.span
						key={`pulse-${t.id}`}
						aria-hidden
						className="absolute left-1/2 top-[18%] size-2 -translate-x-1/2 rounded-full bg-sky-300"
						animate={{
							x: ["0%", `${(t.x - 50) * 2.2}%`],
							y: ["0%", "120%"],
							opacity: [0, 1, 0],
							scale: [0.6, 1, 0.4],
						}}
						transition={{
							duration: 1.8,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
							delay: 0.35 * i,
							repeatDelay: 0.8,
						}}
					/>
				))}

			<motion.div
				className="relative z-10 mx-auto w-fit rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30"
				initial={reduce ? false : { opacity: 0, y: 10, scale: 0.94 }}
				whileInView={{ opacity: 1, y: 0, scale: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 0.5, ease: EASE }}
			>
				<span className="inline-flex items-center gap-2">
					<motion.span
						animate={reduce ? undefined : { x: [0, 3, 0] }}
						transition={{
							duration: 1.4,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
					>
						<Send className="size-3.5" />
					</motion.span>
					Publish to board
				</span>
			</motion.div>

			<div className="absolute inset-x-0 bottom-1 flex justify-center gap-2.5 sm:gap-3">
				{targets.map((t, i) => (
					<motion.span
						key={t.id}
						initial={reduce ? false : { opacity: 0, y: 16, scale: 0.8 }}
						whileInView={{ opacity: 1, y: 0, scale: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.35 + i * 0.1, duration: 0.45, ease: EASE }}
						className="flex size-10 items-center justify-center rounded-lg border border-white/12 bg-white/5 text-white/75"
					>
						{!reduce && (
							<motion.span
								animate={{ y: [0, -2, 0] }}
								transition={{
									duration: 2,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
									delay: i * 0.15,
								}}
								className="flex"
							>
								<FileText className="size-4" />
							</motion.span>
						)}
						{reduce && <FileText className="size-4" />}
					</motion.span>
				))}
			</div>
		</div>
	);
}
