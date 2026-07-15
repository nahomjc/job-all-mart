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
	Sparkles,
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
			"Sign up with email or Telegram. Takes about a minute.",
		icon: Briefcase,
		color: "from-amber-400 to-yellow-600",
	},
	{
		id: "details",
		number: "02",
		title: "Fill in job details",
		description:
			"Add title, company, category, salary, description, and an optional logo.",
		icon: FileText,
		color: "from-amber-400 to-yellow-600",
	},
	{
		id: "payment",
		number: "03",
		title: "Upload payment proof",
		description:
			"Pay for your plan, then upload a screenshot of the transfer.",
		icon: CreditCard,
		color: "from-violet-500 to-purple-600",
	},
	{
		id: "review",
		number: "04",
		title: "Admin review",
		description:
			"We check the payment and the job details. Usually done in a few hours.",
		icon: Shield,
		color: "from-amber-500 to-orange-600",
	},
	{
		id: "live",
		number: "05",
		title: "Go live on Telegram",
		description:
			"When approved, the job appears on the website and in the matching Telegram topic.",
		icon: Rocket,
		color: "from-primary to-brand-deep",
	},
] as const;

const CYCLE_MS = 4200;

const panel = {
	initial: { opacity: 0, y: 28, scale: 0.94, filter: "blur(6px)" },
	animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
	exit: { opacity: 0, y: -20, scale: 0.97, filter: "blur(4px)" },
};

function StepVisual({
	stepId,
	reduce,
}: {
	stepId: (typeof STEPS)[number]["id"];
	reduce: boolean;
}) {
	return (
		<div className="relative flex h-full min-h-[340px] items-center justify-center overflow-hidden p-6 sm:min-h-[400px] sm:p-8">
			{/* Ambient orbs */}
			{!reduce && (
				<>
					<motion.span
						aria-hidden
						className="absolute left-[12%] top-[18%] size-28 rounded-full bg-primary/15 blur-3xl"
						animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.6, 0.35] }}
						transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
					/>
					<motion.span
						aria-hidden
						className="absolute bottom-[14%] right-[10%] size-36 rounded-full bg-amber-400/10 blur-3xl"
						animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.25, 0.5, 0.25] }}
						transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
					/>
				</>
			)}

			<AnimatePresence mode="wait">
				{stepId === "account" && (
					<motion.div
						key="account"
						variants={panel}
						initial="initial"
						animate="animate"
						exit="exit"
						transition={{ duration: 0.5, ease: EASE }}
						className="relative w-full max-w-sm rounded-2xl border bg-card/95 p-6 shadow-2xl shadow-primary/10 backdrop-blur-sm"
					>
						<div className="flex items-center justify-between">
							<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
								Sign up
							</p>
							{!reduce && (
								<motion.span
									animate={{ rotate: [0, 15, -10, 0] }}
									transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
								>
									<Sparkles className="size-4 text-primary" />
								</motion.span>
							)}
						</div>

						<div className="mt-4 space-y-3">
							{["Email", "Full name"].map((label, i) => (
								<motion.div
									key={label}
									initial={reduce ? false : { opacity: 0, x: -16 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.15 + i * 0.15, duration: 0.4, ease: EASE }}
									className="overflow-hidden rounded-xl border bg-muted/40 px-3 py-2.5"
								>
									<p className="text-[10px] text-muted-foreground">{label}</p>
									<motion.div
										className="mt-1.5 h-2 origin-left rounded-full bg-foreground/15"
										initial={reduce ? false : { scaleX: 0 }}
										animate={{ scaleX: 1 }}
										transition={{ delay: 0.3 + i * 0.15, duration: 0.55, ease: EASE }}
										style={{ width: i === 0 ? "78%" : "62%" }}
									/>
								</motion.div>
							))}

							<motion.button
								type="button"
								tabIndex={-1}
								initial={reduce ? false : { scaleX: 0, opacity: 0 }}
								animate={{ scaleX: 1, opacity: 1 }}
								transition={{ delay: 0.55, duration: 0.4, ease: EASE }}
								className="relative h-11 w-full origin-left overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground"
							>
								{!reduce && (
									<motion.span
										aria-hidden
										className="absolute inset-y-0 w-12 bg-linear-to-r from-transparent via-white/25 to-transparent"
										animate={{ x: ["-60%", "280%"] }}
										transition={{
											duration: 1.6,
											repeat: Number.POSITIVE_INFINITY,
											repeatDelay: 1.4,
											ease: "easeInOut",
										}}
									/>
								)}
								Create account
							</motion.button>
						</div>

						<motion.p
							initial={reduce ? false : { opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.85 }}
							className="mt-4 flex items-center gap-2 text-sm font-medium text-amber-600"
						>
							<motion.span
								initial={reduce ? false : { scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.9, type: "spring", stiffness: 320 }}
							>
								<CheckCircle2 className="size-4" />
							</motion.span>
							Account ready
						</motion.p>
					</motion.div>
				)}

				{stepId === "details" && (
					<motion.div
						key="details"
						variants={panel}
						initial="initial"
						animate="animate"
						exit="exit"
						transition={{ duration: 0.5, ease: EASE }}
						className="relative w-full max-w-sm rounded-2xl border bg-card/95 p-5 shadow-2xl shadow-primary/10 backdrop-blur-sm"
					>
						<p className="text-xs font-semibold text-primary">New job post</p>

						{[
							{ label: "Job title", value: "Senior Software Engineer", delay: 0.12 },
							{ label: "Company", value: "Acme Tech · Remote", delay: 0.28 },
						].map((field) => (
							<motion.div
								key={field.label}
								initial={reduce ? false : { opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: field.delay, duration: 0.4, ease: EASE }}
								className="mt-3 overflow-hidden rounded-xl border p-3"
							>
								<p className="text-[10px] text-muted-foreground">{field.label}</p>
								<motion.p
									className="font-semibold"
									initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
									animate={{ clipPath: "inset(0 0% 0 0)" }}
									transition={{ delay: field.delay + 0.15, duration: 0.55, ease: EASE }}
								>
									{field.value}
								</motion.p>
							</motion.div>
						))}

						<motion.div
							initial={reduce ? false : { opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							transition={{ delay: 0.45, duration: 0.4 }}
							className="mt-3 space-y-2 overflow-hidden rounded-xl bg-muted/70 p-3"
						>
							{[88, 70, 52].map((w, i) => (
								<motion.div
									key={`d-${w}`}
									className="h-1.5 origin-left rounded-full bg-foreground/12"
									style={{ width: `${w}%` }}
									initial={reduce ? false : { scaleX: 0 }}
									animate={{ scaleX: 1 }}
									transition={{ delay: 0.55 + i * 0.1, duration: 0.4, ease: EASE }}
								/>
							))}
						</motion.div>

						<motion.div
							initial={reduce ? false : { scaleX: 0, opacity: 0 }}
							animate={{ scaleX: 1, opacity: 1 }}
							transition={{ delay: 0.85, duration: 0.35, ease: EASE }}
							className="mt-3 h-10 origin-left rounded-xl bg-primary"
						/>
					</motion.div>
				)}

				{stepId === "payment" && (
					<motion.div
						key="payment"
						variants={panel}
						initial="initial"
						animate="animate"
						exit="exit"
						transition={{ duration: 0.5, ease: EASE }}
						className="relative w-full max-w-sm rounded-2xl border bg-card/95 p-5 shadow-2xl shadow-violet-500/10 backdrop-blur-sm"
					>
						<p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
							Pending payment
						</p>

						<motion.div
							initial={reduce ? false : { opacity: 0, scale: 0.88, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							transition={{ delay: 0.15, type: "spring", stiffness: 220 }}
							className="relative mt-4 overflow-hidden rounded-xl border-2 border-dashed border-primary/35 bg-primary/5 p-6 text-center"
						>
							{!reduce && (
								<motion.span
									aria-hidden
									className="pointer-events-none absolute inset-y-0 w-16 bg-linear-to-r from-transparent via-primary/20 to-transparent"
									animate={{ x: ["-40%", "220%"] }}
									transition={{
										duration: 2,
										repeat: Number.POSITIVE_INFINITY,
										repeatDelay: 0.8,
										ease: "easeInOut",
									}}
								/>
							)}

							<motion.span
								className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary"
								animate={reduce ? undefined : { y: [0, -6, 0] }}
								transition={{
									duration: 1.6,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
							>
								<CreditCard className="size-6" />
							</motion.span>
							<p className="mt-3 text-sm font-medium">Upload screenshot</p>

							<div className="mx-auto mt-4 h-2 w-4/5 overflow-hidden rounded-full bg-muted">
								<motion.div
									className="h-full rounded-full bg-primary"
									initial={reduce ? { width: "84%" } : { width: "0%" }}
									animate={{ width: "84%" }}
									transition={{ delay: 0.35, duration: 1.15, ease: EASE }}
								/>
							</div>
							<p className="mt-2 text-[11px] text-muted-foreground">
								receipt.png · 84%
							</p>
						</motion.div>

						<motion.p
							initial={reduce ? false : { opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 1 }}
							className="mt-3 text-center text-xs text-muted-foreground"
						>
							Ref: TXN-48291 · ETB 500
						</motion.p>
					</motion.div>
				)}

				{stepId === "review" && (
					<motion.div
						key="review"
						variants={panel}
						initial="initial"
						animate="animate"
						exit="exit"
						transition={{ duration: 0.5, ease: EASE }}
						className="relative w-full max-w-sm rounded-2xl border bg-card/95 p-5 shadow-2xl shadow-amber-500/10 backdrop-blur-sm"
					>
						<div className="flex items-center justify-between">
							<p className="text-xs font-semibold text-amber-600">Under review</p>
							{!reduce && (
								<motion.span
									animate={{ rotate: 360 }}
									transition={{
										duration: 1.4,
										repeat: Number.POSITIVE_INFINITY,
										ease: "linear",
									}}
									className="size-5 rounded-full border-2 border-amber-400 border-t-transparent"
								/>
							)}
						</div>

						<div className="mt-4 space-y-2">
							{[
								{ label: "Payment verified", done: true },
								{ label: "Content check", done: true },
								{ label: "Final approval", done: false },
							].map((item, i) => (
								<motion.div
									key={item.label}
									initial={reduce ? false : { opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.18 + i * 0.22, duration: 0.4, ease: EASE }}
									className="flex items-center gap-2.5 rounded-xl bg-muted/50 px-3 py-2.5 text-sm"
								>
									<motion.span
										initial={reduce ? false : { scale: 0 }}
										animate={{ scale: 1 }}
										transition={{
											delay: 0.32 + i * 0.22,
											type: "spring",
											stiffness: 360,
										}}
									>
										<CheckCircle2
											className={cn(
												"size-4",
												item.done ? "text-amber-500" : "text-muted-foreground/35",
											)}
										/>
									</motion.span>
									<span className={cn(!item.done && "text-muted-foreground")}>
										{item.label}
									</span>
									{!item.done && !reduce && (
										<motion.span
											className="ml-auto size-1.5 rounded-full bg-amber-400"
											animate={{ opacity: [0.3, 1, 0.3] }}
											transition={{
												duration: 1.2,
												repeat: Number.POSITIVE_INFINITY,
											}}
										/>
									)}
								</motion.div>
							))}
						</div>
					</motion.div>
				)}

				{stepId === "live" && (
					<motion.div
						key="live"
						variants={panel}
						initial="initial"
						animate="animate"
						exit="exit"
						transition={{ duration: 0.5, ease: EASE }}
						className="relative w-full max-w-sm"
					>
						{!reduce &&
							[0, 1, 2].map((i) => (
								<motion.span
									key={`ring-${i}`}
									aria-hidden
									className="absolute -right-1 -top-1 size-14 rounded-full border border-amber-400/40"
									animate={{ scale: [1, 1.8 + i * 0.2], opacity: [0.5, 0] }}
									transition={{
										duration: 2,
										repeat: Number.POSITIVE_INFINITY,
										delay: i * 0.45,
										ease: "easeOut",
									}}
								/>
							))}

						<motion.div
							initial={reduce ? false : { opacity: 0, y: 18 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1, duration: 0.45, ease: EASE }}
							className="rounded-2xl border bg-card p-4 shadow-xl"
						>
							<div className="flex items-center gap-2">
								<motion.span
									initial={reduce ? false : { scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.25, type: "spring" }}
									className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
								>
									POSTED
								</motion.span>
								<p className="text-sm font-semibold">Senior Software Engineer</p>
							</div>
							<p className="mt-1 text-xs text-muted-foreground">
								Acme Tech · Remote · $80k–$120k
							</p>
						</motion.div>

						<motion.div
							initial={reduce ? false : { opacity: 0, x: 28, rotate: 4 }}
							animate={{ opacity: 1, x: 0, rotate: 0 }}
							transition={{ delay: 0.35, type: "spring", stiffness: 200 }}
							className="mt-3 flex items-center gap-2 rounded-2xl bg-[#2AABEE] px-4 py-3 text-white shadow-lg shadow-[#2AABEE]/35"
						>
							<motion.span
								animate={reduce ? undefined : { x: [0, 3, 0] }}
								transition={{
									duration: 1.2,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
							>
								<Send className="size-4" />
							</motion.span>
							<div>
								<p className="text-[10px] opacity-90">Sent to Telegram</p>
								<p className="text-xs font-semibold">IT Jobs topic · 2.4k views</p>
							</div>
						</motion.div>

						<motion.div
							initial={reduce ? false : { scale: 0, rotate: -20 }}
							animate={{ scale: 1, rotate: 0 }}
							transition={{ delay: 0.55, type: "spring", stiffness: 280 }}
							className="absolute -right-2 -top-2 z-10 flex size-12 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/40"
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

	useEffect(() => {
		if (!isInView || reduceMotion) return;
		const id = setInterval(() => {
			setActive((i) => (i + 1) % STEPS.length);
		}, CYCLE_MS);
		return () => clearInterval(id);
	}, [isInView, reduceMotion]);

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
						Steps
					</p>
					<h2 className="mt-3 text-balance text-3xl font-bold tracking-tight md:text-4xl">
						Post a job in five steps
					</h2>
					<p className="mt-4 text-pretty text-muted-foreground md:text-lg">
						Create an account, submit the job, pay, wait for review, then go live
						on Telegram.
					</p>
				</motion.div>

				<div className="grid overflow-hidden rounded-[2rem] border bg-card shadow-xl shadow-black/5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
					<div className="border-b p-6 sm:p-8 lg:max-h-[560px] lg:border-b-0 lg:border-r lg:overflow-y-auto">
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
										<button
											type="button"
											onClick={() => goTo(i)}
											aria-current={isActive ? "step" : undefined}
											className="w-full text-left"
										>
											<motion.div
												layout
												className={cn(
													"flex w-full items-start gap-4 rounded-2xl p-4 transition-colors",
													isActive
														? "bg-primary/10 ring-1 ring-primary/20"
														: "opacity-60 hover:opacity-90",
												)}
											>
												<motion.span
													animate={{
														scale: isActive ? 1.06 : 1,
													}}
													transition={{ type: "spring", stiffness: 320, damping: 20 }}
													className={cn(
														"flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
														isActive
															? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
															: "bg-muted text-muted-foreground",
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
															isActive
																? "text-foreground"
																: "text-muted-foreground",
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
																transition={{ duration: 0.35, ease: EASE }}
																className="mt-1 overflow-hidden text-sm leading-relaxed text-muted-foreground"
															>
																{s.description}
															</motion.p>
														)}
													</AnimatePresence>
												</div>
											</motion.div>
										</button>
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
								<Link href="/post/new">
									Start posting <ArrowRight className="size-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" className="rounded-full">
								<Link href="/pricing">View pricing</Link>
							</Button>
						</motion.div>
					</div>

					<div className="relative bg-muted/30">
						<div
							aria-hidden
							className={cn(
								"pointer-events-none absolute inset-0 bg-linear-to-br opacity-15 transition-opacity duration-500",
								step.color,
							)}
						/>
						<div className="relative">
							<div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3">
								<AnimatePresence mode="wait">
									<motion.div
										key={step.id}
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 8 }}
										transition={{ duration: 0.3, ease: EASE }}
										className="flex items-center gap-2"
									>
										<span
											className={cn(
												"flex size-8 items-center justify-center rounded-lg bg-linear-to-br text-white shadow-sm",
												step.color,
											)}
										>
											<Icon className="size-4" />
										</span>
										<span className="text-sm font-semibold">{step.title}</span>
									</motion.div>
								</AnimatePresence>
							</div>
							<StepVisual stepId={step.id} reduce={!!reduceMotion} />
						</div>
					</div>
				</div>

				<div className="mt-8 flex justify-center gap-2">
					{STEPS.map((s, i) => (
						<button
							key={s.id}
							type="button"
							aria-label={`Go to step ${i + 1}: ${s.title}`}
							onClick={() => goTo(i)}
							className={cn(
								"h-2 overflow-hidden rounded-full transition-all",
								i === active ? "w-8 bg-muted" : "w-2 bg-muted-foreground/30",
							)}
						>
							{i === active && !reduceMotion && (
								<motion.span
									key={`dot-${active}`}
									className="block h-full origin-left rounded-full bg-primary"
									initial={{ scaleX: 0 }}
									animate={{ scaleX: 1 }}
									transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
								/>
							)}
							{i === active && reduceMotion && (
								<span className="block h-full w-full rounded-full bg-primary" />
							)}
						</button>
					))}
				</div>
			</div>
		</MotionSection>
	);
}
