"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
	ArrowLeft,
	ArrowRight,
	Banknote,
	CheckCircle2,
	ClipboardCheck,
	FileText,
	HelpCircle,
	ImagePlus,
	Lightbulb,
	ListChecks,
	Rocket,
	Send,
	Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const GUIDE_STEPS = [
	{
		id: "overview",
		icon: ListChecks,
		label: "Overview",
		title: "From draft to live in six steps",
		body: "Complete the form, review your listing, upload payment proof, then our team verifies everything before it appears on the site and Telegram.",
		points: [
			"About 5–10 minutes end to end",
			"You can revisit earlier steps before submit",
			"Nothing goes public until payment is checked",
		],
		tip: "Have your job description and payment screenshot ready before you start.",
	},
	{
		id: "basics",
		icon: FileText,
		label: "Basics",
		title: "Write a role people will open",
		body: "Start with a precise title, company name, and a full description. This is what candidates read first — and what appears on Telegram.",
		points: [
			"Title: specific role, not “Hiring now”",
			"Company: the hiring brand candidates will trust",
			"Description: responsibilities, requirements, culture",
		],
		tip: "Example title: “Senior React Engineer” — not “Urgent vacancy”.",
	},
	{
		id: "details",
		icon: ClipboardCheck,
		label: "Details",
		title: "Place the job in the right lane",
		body: "Category, location, employment type, and deadline shape who sees the post. Category also maps to the Telegram topic.",
		points: [
			"Pick the closest category for reach",
			"Set a realistic application deadline",
			"Remote / hybrid options attract more applicants",
		],
		tip: "Wrong category = wrong audience. Choose carefully.",
	},
	{
		id: "pay",
		icon: Banknote,
		label: "Pay",
		title: "Be clear about compensation",
		body: "Salary range and currency help candidates self-select and usually pass review faster when the numbers look realistic.",
		points: [
			"Share a range when possible",
			"Use the correct currency (ETB, USD, …)",
			"Negotiable is fine — still give a ballpark",
		],
		tip: "Transparent pay gets stronger applications.",
	},
	{
		id: "apply",
		icon: ImagePlus,
		label: "Apply",
		title: "Tell them exactly how to apply",
		body: "Add the apply method (email, link, or phone) and optionally a company logo for a more polished public listing.",
		points: [
			"Verify the apply email or URL works",
			"Logo is optional but recommended",
			"Keep instructions short and direct",
		],
		tip: "A broken apply link wastes your paid listing.",
	},
	{
		id: "review",
		icon: CheckCircle2,
		label: "Review",
		title: "Check once, then submit",
		body: "Confirm every field on the summary screen. After you submit, this flow moves you to payment.",
		points: [
			"Scan for typos — they show on Telegram",
			"Confirm category and salary one more time",
			"Submit only when the summary looks final",
		],
		tip: "A 20-second re-read saves a rejection later.",
	},
	{
		id: "payment",
		icon: Send,
		label: "Payment",
		title: "Upload clear payment proof",
		body: "Pay for your plan, then upload a screenshot of the transfer. We verify amount and reference before publishing.",
		points: [
			"Screenshot should show amount and date",
			"Include the transfer reference if visible",
			"PNG, JPG, WebP, or GIF — keep it readable",
		],
		tip: "Blurry or cropped receipts slow approval.",
	},
	{
		id: "live",
		icon: Rocket,
		label: "Go live",
		title: "We review — then you go live",
		body: "An admin checks the job and payment. When approved, the listing appears on the website and the matching Telegram topic.",
		points: [
			"Most reviews finish within a few hours",
			"Track status from your dashboard",
			"You’ll get updates if anything needs changes",
		],
		tip: "Open Dashboard anytime to follow progress.",
	},
] as const;

export function PostJobHelpDialog() {
	const [open, setOpen] = useState(false);
	const [step, setStep] = useState(0);
	const reduceMotion = useReducedMotion();
	const current = GUIDE_STEPS[step];
	const Icon = current.icon;
	const isLast = step === GUIDE_STEPS.length - 1;
	const progress = ((step + 1) / GUIDE_STEPS.length) * 100;

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (next) setStep(0);
	};

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") {
				setStep((s) => Math.min(GUIDE_STEPS.length - 1, s + 1));
			} else if (e.key === "ArrowLeft") {
				setStep((s) => Math.max(0, s - 1));
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="h-9 gap-2 rounded-full border-border/80 bg-card px-3 shadow-sm hover:border-primary/40 hover:bg-primary/10"
					aria-label="How to post a job"
				>
					<span className="flex size-5 items-center justify-center rounded-full bg-brand-deep text-primary">
						<HelpCircle className="size-3.5" />
					</span>
					<span className="hidden text-sm font-medium sm:inline">
						How to post
					</span>
				</Button>
			</DialogTrigger>

			<DialogContent
				className={cn(
					"max-h-[min(92dvh,880px)] max-w-[calc(100%-1.25rem)] gap-0 overflow-hidden border-border/70 p-0 shadow-2xl sm:max-w-3xl sm:rounded-3xl",
					"[&>button]:right-4 [&>button]:top-4 [&>button]:z-20 [&>button]:rounded-full [&>button]:bg-white/10 [&>button]:p-1.5 [&>button]:text-white [&>button]:opacity-100 [&>button]:hover:bg-white/20 [&>button]:hover:opacity-100",
				)}
			>
				{/* Hero */}
				<div className="relative overflow-hidden bg-brand-deep px-5 pb-5 pt-6 text-white sm:px-7 sm:pb-6 sm:pt-7">
					<div
						aria-hidden
						className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-amber-400/25 blur-3xl"
					/>
					<div
						aria-hidden
						className="pointer-events-none absolute -bottom-24 left-10 size-48 rounded-full bg-white/10 blur-3xl"
					/>
					<div
						aria-hidden
						className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_55%)]"
					/>

					<div className="relative space-y-4 pr-8">
						<div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
							<Sparkles className="size-3.5 text-amber-300" />
							Employer guide
						</div>
						<div>
							<DialogTitle className="text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl">
								How to post a job
							</DialogTitle>
							<DialogDescription className="mt-2 max-w-xl text-sm leading-relaxed text-white/70 sm:text-[15px]">
								A clear walkthrough of every step — from writing the role to
								going live on Telegram.
							</DialogDescription>
						</div>

						<div className="space-y-2 pt-1">
							<div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-white/55">
								<span>
									Step {step + 1} of {GUIDE_STEPS.length}
								</span>
								<span>{Math.round(progress)}%</span>
							</div>
							<div className="h-1.5 overflow-hidden rounded-full bg-white/15">
								<motion.div
									className="h-full rounded-full bg-linear-to-r from-amber-300 to-primary"
									initial={false}
									animate={{ width: `${progress}%` }}
									transition={
										reduceMotion
											? { duration: 0 }
											: { type: "spring", stiffness: 280, damping: 28 }
									}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Body */}
				<div className="grid max-h-[min(58dvh,520px)] overflow-hidden sm:grid-cols-[200px_1fr]">
					{/* Step rail */}
					<aside className="hidden border-r border-border/70 bg-muted/40 p-3 sm:block">
						<p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
							Contents
						</p>
						<nav aria-label="Guide steps" className="space-y-0.5">
							{GUIDE_STEPS.map((s, i) => {
								const active = i === step;
								const done = i < step;
								return (
									<button
										key={s.id}
										type="button"
										onClick={() => setStep(i)}
										className={cn(
											"flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition",
											active &&
												"bg-card font-semibold text-foreground shadow-sm ring-1 ring-border",
											!active &&
												done &&
												"text-foreground/80 hover:bg-card/70",
											!active &&
												!done &&
												"text-muted-foreground hover:bg-card/50 hover:text-foreground",
										)}
									>
										<span
											className={cn(
												"flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
												active && "bg-brand-deep text-primary",
												done && !active && "bg-primary/20 text-primary-foreground",
												!active && !done && "bg-muted text-muted-foreground",
											)}
										>
											{done && !active ? (
												<CheckCircle2 className="size-3.5 text-amber-700 dark:text-amber-300" />
											) : (
												i + 1
											)}
										</span>
										<span className="truncate">{s.label}</span>
									</button>
								);
							})}
						</nav>
					</aside>

					{/* Active step */}
					<div className="overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
						{/* Mobile step chips */}
						<div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 sm:hidden">
							{GUIDE_STEPS.map((s, i) => (
								<button
									key={s.id}
									type="button"
									onClick={() => setStep(i)}
									className={cn(
										"shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
										i === step
											? "bg-brand-deep text-primary"
											: i < step
												? "bg-primary/20 text-foreground"
												: "bg-muted text-muted-foreground",
									)}
								>
									{s.label}
								</button>
							))}
						</div>

						<AnimatePresence mode="wait">
							<motion.div
								key={current.id}
								initial={
									reduceMotion ? false : { opacity: 0, y: 12, filter: "blur(4px)" }
								}
								animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
								exit={
									reduceMotion
										? undefined
										: { opacity: 0, y: -8, filter: "blur(4px)" }
								}
								transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
								className="space-y-5"
							>
								<div className="flex items-start gap-4">
									<span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/30 to-primary/5 text-brand-deep shadow-inner ring-1 ring-primary/25 dark:text-primary">
										<Icon className="size-7" strokeWidth={1.75} />
									</span>
									<div className="min-w-0 space-y-1.5 pt-0.5">
										<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/70 dark:text-primary/80">
											{current.label}
										</p>
										<h3 className="text-balance text-xl font-bold tracking-tight text-foreground sm:text-[1.35rem]">
											{current.title}
										</h3>
									</div>
								</div>

								<p className="text-pretty text-[15px] leading-relaxed text-muted-foreground">
									{current.body}
								</p>

								<ul className="space-y-2.5">
									{current.points.map((point) => (
										<li
											key={point}
											className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/80 px-3.5 py-2.5 text-sm text-foreground shadow-sm"
										>
											<span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-amber-800 dark:text-amber-200">
												<CheckCircle2 className="size-3.5" />
											</span>
											<span className="leading-snug">{point}</span>
										</li>
									))}
								</ul>

								<div className="flex gap-3 rounded-2xl border border-amber-500/20 bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent px-4 py-3.5">
									<span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-200">
										<Lightbulb className="size-4" />
									</span>
									<div>
										<p className="text-xs font-semibold uppercase tracking-wider text-amber-900/80 dark:text-amber-200/90">
											Pro tip
										</p>
										<p className="mt-1 text-sm leading-relaxed text-foreground/90">
											{current.tip}
										</p>
									</div>
								</div>
							</motion.div>
						</AnimatePresence>
					</div>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between gap-3 border-t border-border/70 bg-card/90 px-4 py-3.5 backdrop-blur sm:px-6">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="gap-1.5 rounded-full"
						disabled={step === 0}
						onClick={() => setStep((s) => Math.max(0, s - 1))}
					>
						<ArrowLeft className="size-3.5" />
						Back
					</Button>

					<div className="hidden items-center gap-1.5 sm:flex" aria-hidden>
						{GUIDE_STEPS.map((s, i) => (
							<span
								key={s.id}
								className={cn(
									"size-1.5 rounded-full transition-all",
									i === step
										? "w-4 bg-brand-deep dark:bg-primary"
										: i < step
											? "bg-primary"
											: "bg-border",
								)}
							/>
						))}
					</div>

					<div className="flex items-center gap-2">
						{!isLast && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="rounded-full text-muted-foreground"
								onClick={() => setOpen(false)}
							>
								Skip guide
							</Button>
						)}
						<Button
							type="button"
							size="sm"
							className="h-9 gap-1.5 rounded-full bg-brand-deep px-4 text-primary hover:bg-brand-deep/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
							onClick={() => {
								if (isLast) {
									setOpen(false);
									return;
								}
								setStep((s) => Math.min(GUIDE_STEPS.length - 1, s + 1));
							}}
						>
							{isLast ? (
								<>
									Start posting
									<Rocket className="size-3.5" />
								</>
							) : (
								<>
									Continue
									<ArrowRight className="size-3.5" />
								</>
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
