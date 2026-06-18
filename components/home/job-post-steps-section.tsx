"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
	AnimatePresence,
	motion,
	useInView,
	useReducedMotion,
} from "framer-motion";
import {
	ArrowRight,
	Briefcase,
	CheckCircle2,
	CreditCard,
	FileText,
	Rocket,
	Shield,
	Send,
} from "lucide-react";
import { EASE, MotionSection } from "@/components/home/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
	{
		id: "account",
		number: "01",
		title: "Create your account",
		description:
			"Sign up with email or Telegram in under a minute. No lengthy onboarding — just name and you're in.",
		icon: Briefcase,
		color: "from-sky-500 to-blue-600",
	},
	{
		id: "details",
		number: "02",
		title: "Fill in job details",
		description:
			"Add title, company, category, salary, and description. Upload your company logo if you want extra visibility.",
		icon: FileText,
		color: "from-sky-500 to-blue-600",
	},
	{
		id: "payment",
		number: "03",
		title: "Upload payment proof",
		description:
			"Pay per your plan, then upload a screenshot of the transfer. We match it against your submission.",
		icon: CreditCard,
		color: "from-violet-500 to-purple-600",
	},
	{
		id: "review",
		number: "04",
		title: "Admin review",
		description:
			"Our team verifies payment and checks the listing for quality. Usually within a few hours.",
		icon: Shield,
		color: "from-amber-500 to-orange-600",
	},
	{
		id: "live",
		number: "05",
		title: "Go live on Telegram",
		description:
			"Once approved, your job is published on the website and posted to the right Telegram channel topic.",
		icon: Rocket,
		color: "from-primary to-brand-deep",
	},
] as const;

const CYCLE_MS = 3800;

function StepVisual({ stepId }: { stepId: (typeof STEPS)[number]["id"] }) {
	const reduce = useReducedMotion();

	return (
		<div className="relative flex h-full min-h-[320px] items-center justify-center p-6 sm:min-h-[380px] sm:p-8">
			<motion.div
				aria-hidden
				className="absolute inset-4 rounded-3xl bg-linear-to-br from-primary/5 to-transparent"
				animate={reduce ? undefined : { opacity: [0.5, 1, 0.5] }}
				transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
			/>

			<AnimatePresence mode="wait">
				{stepId === "account" && (
					<motion.div
						key="account"
						initial={{ opacity: 0, y: 24, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -16, scale: 0.98 }}
						transition={{ duration: 0.45, ease: EASE }}
						className="relative w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl"
					>
						<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Sign up
						</p>
						<div className="mt-4 space-y-3">
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: "100%" }}
								transition={{ delay: 0.2, duration: 0.4 }}
								className="h-10 rounded-lg bg-muted"
							/>
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: "85%" }}
								transition={{ delay: 0.35, duration: 0.4 }}
								className="h-10 rounded-lg bg-muted"
							/>
							<motion.div
								initial={{ scaleX: 0 }}
								animate={{ scaleX: 1 }}
								transition={{ delay: 0.5, duration: 0.35 }}
								className="h-11 origin-left rounded-full bg-primary"
							/>
						</div>
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.7 }}
							className="mt-4 flex items-center gap-2 text-sm text-sky-600"
						>
							<CheckCircle2 className="size-4" />
							Account ready
						</motion.p>
					</motion.div>
				)}

				{stepId === "details" && (
					<motion.div
						key="details"
						initial={{ opacity: 0, y: 24, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -16, scale: 0.98 }}
						transition={{ duration: 0.45, ease: EASE }}
						className="relative w-full max-w-sm rounded-2xl border bg-card p-5 shadow-xl"
					>
						<p className="text-xs font-semibold text-primary">New job post</p>
						<motion.div
							initial={{ opacity: 0, x: -12 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.15 }}
							className="mt-3 rounded-xl border p-3"
						>
							<p className="text-[10px] text-muted-foreground">Job title</p>
							<p className="font-semibold">Senior Software Engineer</p>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, x: -12 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.3 }}
							className="mt-2 rounded-xl border p-3"
						>
							<p className="text-[10px] text-muted-foreground">Company</p>
							<p className="text-sm font-medium">Acme Tech · Remote</p>
						</motion.div>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
							className="mt-3 h-16 rounded-xl bg-muted/80"
						/>
						<motion.div
							initial={{ scaleX: 0 }}
							animate={{ scaleX: 1 }}
							transition={{ delay: 0.65, duration: 0.35 }}
							className="mt-3 h-9 origin-left rounded-lg bg-primary"
						/>
					</motion.div>
				)}

				{stepId === "payment" && (
					<motion.div
						key="payment"
						initial={{ opacity: 0, y: 24, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -16, scale: 0.98 }}
						transition={{ duration: 0.45, ease: EASE }}
						className="relative w-full max-w-sm rounded-2xl border bg-card p-5 shadow-xl"
					>
						<p className="text-xs font-semibold text-amber-600">
							Pending payment
						</p>
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.2, type: "spring" }}
							className="mt-4 flex flex-col items-center rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-6"
						>
							<CreditCard className="size-8 text-primary" />
							<p className="mt-2 text-sm font-medium">Upload screenshot</p>
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: "80%" }}
								transition={{ delay: 0.5, duration: 0.5 }}
								className="mt-3 h-2 rounded-full bg-primary"
							/>
						</motion.div>
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.8 }}
							className="mt-3 text-center text-xs text-muted-foreground"
						>
							Ref: TXN-48291 · ETB 500
						</motion.p>
					</motion.div>
				)}

				{stepId === "review" && (
					<motion.div
						key="review"
						initial={{ opacity: 0, y: 24, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -16, scale: 0.98 }}
						transition={{ duration: 0.45, ease: EASE }}
						className="relative w-full max-w-sm rounded-2xl border bg-card p-5 shadow-xl"
					>
						<div className="flex items-center justify-between">
							<p className="text-xs font-semibold text-amber-600">
								Under review
							</p>
							<motion.span
								animate={{ rotate: 360 }}
								transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
								className="size-5 rounded-full border-2 border-amber-400 border-t-transparent"
							/>
						</div>
						<div className="mt-4 space-y-2">
							{["Payment verified", "Content check", "Final approval"].map(
								(label, i) => (
									<motion.div
										key={label}
										initial={{ opacity: 0, x: -16 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.2 + i * 0.2 }}
										className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
									>
										<motion.span
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											transition={{ delay: 0.35 + i * 0.2, type: "spring" }}
										>
											<CheckCircle2
												className={cn(
													"size-4",
													i < 2 ? "text-sky-500" : "text-muted-foreground/40",
												)}
											/>
										</motion.span>
										{label}
									</motion.div>
								),
							)}
						</div>
					</motion.div>
				)}

				{stepId === "live" && (
					<motion.div
						key="live"
						initial={{ opacity: 0, y: 24, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -16, scale: 0.98 }}
						transition={{ duration: 0.45, ease: EASE }}
						className="relative w-full max-w-sm"
					>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="rounded-2xl border bg-card p-4 shadow-xl"
						>
							<div className="flex items-center gap-2">
								<span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">
									POSTED
								</span>
								<p className="text-sm font-semibold">Senior Software Engineer</p>
							</div>
							<p className="mt-1 text-xs text-muted-foreground">
								Acme Tech · Remote · $80k–$120k
							</p>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, x: 24 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.35, type: "spring" }}
							className="mt-3 flex items-center gap-2 rounded-2xl bg-[#2AABEE] px-4 py-3 text-white shadow-lg"
						>
							<Send className="size-4" />
							<div>
								<p className="text-[10px] opacity-90">Sent to Telegram</p>
								<p className="text-xs font-semibold">IT Jobs topic · 2.4k views</p>
							</div>
						</motion.div>
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.6, type: "spring" }}
							className="absolute -right-2 -top-2 flex size-12 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg"
						>
							<CheckCircle2 className="size-6" />
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export function JobPostStepsSection() {
	const reduceMotion = useReducedMotion();
	const [active, setActive] = useState(0);
	const sectionRef = useRef<HTMLDivElement>(null);
	const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
	const isInView = useInView(sectionRef, { amount: 0.25, once: false });

	const goTo = useCallback((index: number) => {
		setActive(index % STEPS.length);
	}, []);

	// Auto-advance steps while the section is visible (no click required).
	useEffect(() => {
		if (!isInView) return;
		const id = setInterval(() => {
			setActive((i) => (i + 1) % STEPS.length);
		}, CYCLE_MS);
		return () => clearInterval(id);
	}, [isInView]);

	// Keep the active step scrolled into view in the list.
	useEffect(() => {
		stepRefs.current[active]?.scrollIntoView({
			behavior: reduceMotion ? "auto" : "smooth",
			block: "nearest",
		});
	}, [active, reduceMotion]);

	const step = STEPS[active];
	const Icon = step.icon;

	return (
		<MotionSection
			className="relative border-b bg-background py-20 md:py-28"
			delay={0}
		>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,var(--primary)/0.06,transparent_65%)]"
			/>

			<div ref={sectionRef} className="container relative mx-auto px-4">
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, ease: EASE }}
					className="mx-auto mb-14 max-w-2xl text-center"
				>
					<p className="text-sm font-semibold uppercase tracking-widest text-primary">
						How it works
					</p>
					<h2 className="mt-3 text-balance text-3xl font-bold tracking-tight md:text-4xl">
						Post a job in five simple steps
					</h2>
					<p className="mt-4 text-pretty text-muted-foreground md:text-lg">
						From sign-up to Telegram reach — every listing is moderated and
						payment-verified before it goes live.
					</p>
				</motion.div>

				<div className="grid overflow-hidden rounded-[2rem] border bg-card shadow-xl shadow-black/5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
					{/* Step list */}
					<div className="border-b p-6 sm:p-8 lg:max-h-[520px] lg:border-b-0 lg:border-r lg:overflow-y-auto">
						<div className="mb-6 flex items-center justify-between gap-4">
							<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Step {active + 1} of {STEPS.length}
							</p>
							<div className="flex min-w-0 flex-1 items-center gap-2">
								{!reduceMotion && (
									<motion.span
										key={active}
										initial={{ scaleX: 0 }}
										animate={{ scaleX: 1 }}
										transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
										className="h-1 max-w-32 flex-1 origin-left rounded-full bg-primary"
									/>
								)}
								<span className="shrink-0 text-[10px] font-medium text-primary">
									Auto
								</span>
							</div>
						</div>

						<ol className="space-y-2">
							{STEPS.map((s, i) => {
								const StepIcon = s.icon;
								const isActive = i === active;
								return (
									<li
										key={s.id}
										ref={(el) => {
											stepRefs.current[i] = el;
										}}
									>
										<motion.div
											layout
											aria-current={isActive ? "step" : undefined}
											className={cn(
												"flex w-full items-start gap-4 rounded-2xl p-4 transition-colors",
												isActive
													? "bg-primary/10 ring-1 ring-primary/20"
													: "opacity-60",
											)}
										>
											<motion.span
												animate={{
													scale: isActive ? 1.05 : 1,
													backgroundColor: isActive
														? "var(--primary)"
														: "var(--muted)",
												}}
												className={cn(
													"flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
													isActive
														? "text-primary-foreground"
														: "text-muted-foreground",
												)}
											>
												{isActive ? (
													<StepIcon className="size-5" />
												) : (
													s.number
												)}
											</motion.span>
											<div className="min-w-0 pt-0.5">
												<p
													className={cn(
														"font-semibold",
														isActive ? "text-foreground" : "text-muted-foreground",
													)}
												>
													{s.title}
												</p>
												<AnimatePresence>
													{isActive && (
														<motion.p
															initial={{ opacity: 0, height: 0 }}
															animate={{ opacity: 1, height: "auto" }}
															exit={{ opacity: 0, height: 0 }}
															className="mt-1 text-sm leading-relaxed text-muted-foreground"
														>
															{s.description}
														</motion.p>
													)}
												</AnimatePresence>
											</div>
										</motion.div>
									</li>
								);
							})}
						</ol>

						<motion.div
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.3 }}
							className="mt-8 flex flex-wrap gap-3"
						>
							<Button asChild className="rounded-full">
								<Link href="/login?mode=signup">
									Start posting <ArrowRight className="size-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" className="rounded-full">
								<Link href="/pricing">View pricing</Link>
							</Button>
						</motion.div>
					</div>

					{/* Animated preview */}
					<div className="relative bg-muted/30">
						<div
							aria-hidden
							className={cn(
								"pointer-events-none absolute inset-0 bg-linear-to-br opacity-15",
								step.color,
							)}
						/>
						<div className="relative">
							<div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3">
								<motion.div
									key={step.id}
									initial={{ opacity: 0, x: -8 }}
									animate={{ opacity: 1, x: 0 }}
									className="flex items-center gap-2"
								>
									<span
										className={cn(
											"flex size-8 items-center justify-center rounded-lg bg-linear-to-br text-white",
											step.color,
										)}
									>
										<Icon className="size-4" />
									</span>
									<span className="text-sm font-semibold">{step.title}</span>
								</motion.div>
							</div>
							<StepVisual stepId={step.id} />
						</div>
					</div>
				</div>

				{/* Progress dots */}
				<div className="mt-8 flex justify-center gap-2">
					{STEPS.map((s, i) => (
						<button
							key={s.id}
							type="button"
							aria-label={`Go to step ${i + 1}: ${s.title}`}
							onClick={() => goTo(i)}
							className={cn(
								"h-2 rounded-full transition-all",
								i === active ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30",
							)}
						/>
					))}
				</div>
			</div>
		</MotionSection>
	);
}
