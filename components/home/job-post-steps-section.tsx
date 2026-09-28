"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
	AnimatePresence,
	motion,
	useInView,
	useReducedMotion,
} from "framer-motion";
import {
	ArrowRight,
	Briefcase,
	Check,
	CheckCircle2,
	CreditCard,
	FileText,
	Mail,
	Rocket,
	Shield,
	Send,
	Upload,
} from "lucide-react";
import { EASE, MotionSection } from "@/components/home/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
	{
		id: "account",
		number: "01",
		titleKey: "stepsAccountTitle",
		bodyKey: "stepsAccountBody",
		icon: Briefcase,
	},
	{
		id: "details",
		number: "02",
		titleKey: "stepsDetailsTitle",
		bodyKey: "stepsDetailsBody",
		icon: FileText,
	},
	{
		id: "payment",
		number: "03",
		titleKey: "stepsPaymentTitle",
		bodyKey: "stepsPaymentBody",
		icon: CreditCard,
	},
	{
		id: "review",
		number: "04",
		titleKey: "stepsReviewTitle",
		bodyKey: "stepsReviewBody",
		icon: Shield,
	},
	{
		id: "live",
		number: "05",
		titleKey: "stepsLiveTitle",
		bodyKey: "stepsLiveBody",
		icon: Rocket,
	},
] as const;

type StepId = (typeof STEPS)[number]["id"];

const CYCLE_MS = 5200;

const scene = {
	initial: { opacity: 0, scale: 0.96, y: 18 },
	animate: { opacity: 1, scale: 1, y: 0 },
	exit: { opacity: 0, scale: 0.98, y: -14 },
};

function StageGlow({ reduce }: { reduce: boolean }) {
	return (
		<>
			<motion.div
				aria-hidden
				className="pointer-events-none absolute left-1/2 top-[42%] size-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-3xl sm:size-[300px]"
				animate={
					reduce
						? undefined
						: { scale: [1, 1.12, 1], opacity: [0.35, 0.55, 0.35] }
				}
				transition={{ duration: 4.5, repeat: Number.POSITIVE_INFINITY }}
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_72%)]"
			/>
		</>
	);
}

type HomeT = (key: string) => string;

function AccountScene({
	reduce,
	t,
}: {
	reduce: boolean;
	t: HomeT;
}) {
	return (
		<div className="relative w-full max-w-[300px]">
			<div className="overflow-hidden rounded-2xl border border-white/12 bg-black/35 p-5 shadow-2xl shadow-black/40 backdrop-blur-sm">
				<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
					{t("animSignUp")}
				</p>
				<p className="mt-2 text-lg font-semibold tracking-tight text-white">
					{t("animCreateAccount")}
				</p>

				<div className="mt-5 space-y-2.5">
					{[
						{
							key: "tg",
							icon: Send,
							label: "Telegram",
							tone: "bg-[#229ED9] text-white",
						},
						{
							key: "mail",
							icon: Mail,
							label: t("animEmail"),
							tone: "border border-white/15 bg-white/8 text-white",
						},
					].map((opt, i) => {
						const Icon = opt.icon;
						return (
							<motion.div
								key={opt.key}
								initial={reduce ? false : { opacity: 0, x: -12 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.15 + i * 0.15, duration: 0.4, ease: EASE }}
								className={cn(
									"flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold",
									opt.tone,
								)}
							>
								<Icon className="size-4" />
								{opt.label}
							</motion.div>
						);
					})}
				</div>

				<motion.div
					initial={reduce ? false : { opacity: 0, y: 8, scale: 0.94 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ delay: 0.7, duration: 0.4, ease: EASE }}
					className="mt-4 flex items-center gap-2.5 rounded-xl border border-primary/35 bg-primary/15 px-3 py-2.5"
				>
					<span className="relative flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
						{!reduce && (
							<motion.span
								aria-hidden
								className="absolute inset-0 rounded-full bg-primary/50"
								animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
								transition={{
									duration: 1.4,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeOut",
								}}
							/>
						)}
						<Check className="relative size-3.5 stroke-[3]" />
					</span>
					<span className="text-sm font-medium text-white">
						{t("animAccountReady")}
					</span>
				</motion.div>
			</div>
		</div>
	);
}

function DetailsScene({
	reduce,
	t,
}: {
	reduce: boolean;
	t: HomeT;
}) {
	const fields = [
		{
			key: "title",
			label: t("animJobTitle"),
			value: t("animJobTitleValue"),
			delay: 0.12,
		},
		{
			key: "company",
			label: t("animCompany"),
			value: t("animCompanyValue"),
			delay: 0.38,
		},
	];

	return (
		<div className="relative w-full max-w-[300px] overflow-hidden rounded-2xl border border-white/12 bg-black/35 p-4 shadow-2xl shadow-black/40 backdrop-blur-sm">
			<div className="mb-3 flex items-center gap-1.5">
				<span className="size-2 rounded-full bg-rose-400/80" />
				<span className="size-2 rounded-full bg-amber-300/80" />
				<span className="size-2 rounded-full bg-emerald-400/80" />
				<span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-white/40">
					{t("animNewJobPost")}
				</span>
			</div>

			<div className="space-y-3">
				{fields.map((field) => (
					<div
						key={field.key}
						className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
					>
						<p className="text-[10px] font-medium uppercase tracking-wide text-white/45">
							{field.label}
						</p>
						<motion.p
							className="mt-1 text-sm font-semibold text-white"
							initial={
								reduce
									? false
									: { clipPath: "inset(0 100% 0 0)", opacity: 0.4 }
							}
							animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
							transition={{
								delay: field.delay,
								duration: 0.55,
								ease: EASE,
							}}
						>
							{field.value}
							{!reduce && (
								<motion.span
									aria-hidden
									className="ml-0.5 inline-block h-3.5 w-px translate-y-0.5 bg-primary"
									animate={{ opacity: [1, 0, 1] }}
									transition={{
										duration: 0.9,
										repeat: Number.POSITIVE_INFINITY,
										delay: field.delay + 0.5,
									}}
								/>
							)}
						</motion.p>
					</div>
				))}

				<div className="space-y-2 rounded-xl bg-white/5 p-3">
					{[78, 58, 42].map((w, i) => (
						<motion.div
							key={`d-${w}`}
							className="h-1.5 origin-left rounded-full bg-white/15"
							style={{ width: `${w}%` }}
							initial={reduce ? false : { scaleX: 0 }}
							animate={{ scaleX: 1 }}
							transition={{ delay: 0.7 + i * 0.1, duration: 0.4, ease: EASE }}
						/>
					))}
				</div>

				<motion.div
					initial={reduce ? false : { opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 1.05, duration: 0.4, ease: EASE }}
					className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground shadow-lg shadow-primary/25"
				>
					<CheckCircle2 className="size-3.5" />
					{t("animNewJobPost")}
				</motion.div>
			</div>
		</div>
	);
}

function PaymentScene({
	reduce,
	t,
}: {
	reduce: boolean;
	t: HomeT;
}) {
	return (
		<div className="relative w-full max-w-[300px] rounded-2xl border border-white/12 bg-black/35 p-4 shadow-2xl shadow-black/40 backdrop-blur-sm">
			<p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
				{t("animPendingPayment")}
			</p>

			<div className="relative mt-3 overflow-hidden rounded-xl border border-dashed border-white/20 bg-black/25 px-3 py-4">
				{!reduce && (
					<motion.span
						aria-hidden
						className="pointer-events-none absolute inset-y-0 w-16 bg-linear-to-r from-transparent via-white/10 to-transparent"
						animate={{ x: ["-40%", "240%"] }}
						transition={{
							duration: 2.2,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
							repeatDelay: 0.9,
						}}
					/>
				)}

				<div className="relative flex items-center gap-3">
					<motion.span
						className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary"
						animate={reduce ? undefined : { y: [0, -5, 0] }}
						transition={{
							duration: 1.8,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
					>
						<Upload className="size-5" />
					</motion.span>
					<div className="min-w-0 flex-1">
						<p className="text-sm font-semibold text-white">
							{t("animUploadScreenshot")}
						</p>
						<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
							<motion.div
								className="h-full rounded-full bg-primary"
								initial={reduce ? { width: "84%" } : { width: "0%" }}
								animate={{ width: "84%" }}
								transition={{ delay: 0.2, duration: 1.2, ease: EASE }}
							/>
						</div>
						<p className="mt-1.5 text-[11px] text-white/45">
							{t("animReceiptProgress")}
						</p>
					</div>
				</div>
			</div>

			<motion.div
				initial={reduce ? false : { opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.9, duration: 0.4, ease: EASE }}
				className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
			>
				<span className="font-mono text-[11px] text-white/55">
					{t("animPaymentRef")}
				</span>
				<span className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
					<CreditCard className="size-3.5" />
				</span>
			</motion.div>
		</div>
	);
}

function ReviewScene({
	reduce,
	t,
}: {
	reduce: boolean;
	t: HomeT;
}) {
	const items = [
		{ key: "pay", label: t("animPaymentVerified"), done: true },
		{ key: "content", label: t("animContentCheck"), done: true },
		{ key: "final", label: t("animFinalApproval"), done: false },
	];

	return (
		<div className="relative w-full max-w-[300px]">
			{!reduce && (
				<motion.span
					aria-hidden
					className="absolute left-1/2 top-2 size-24 -translate-x-1/2 rounded-full border border-primary/30"
					animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
					transition={{
						duration: 2.6,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeOut",
					}}
				/>
			)}

			<div className="relative overflow-hidden rounded-2xl border border-white/12 bg-black/35 p-4 shadow-2xl shadow-black/40 backdrop-blur-sm">
				<div className="mb-4 flex items-center gap-3">
					<span className="relative flex size-11 items-center justify-center rounded-xl border border-primary/40 bg-primary/20 text-primary">
						{!reduce && (
							<motion.span
								aria-hidden
								className="absolute inset-0 rounded-xl bg-primary/25"
								animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
								transition={{
									duration: 2,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
							/>
						)}
						<Shield className="relative size-5" />
					</span>
					<div>
						<p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
							{t("animUnderReview")}
						</p>
						<p className="text-sm font-semibold text-white">
							{t("stepsReviewTitle")}
						</p>
					</div>
					{!reduce && (
						<span className="relative ml-auto flex size-2">
							<span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
							<span className="relative inline-flex size-2 rounded-full bg-primary" />
						</span>
					)}
				</div>

				<div className="space-y-2">
					{items.map((item, i) => (
						<motion.div
							key={item.key}
							initial={reduce ? false : { opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.15 + i * 0.18, duration: 0.4, ease: EASE }}
							className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
						>
							<span
								className={cn(
									"flex size-5 shrink-0 items-center justify-center rounded-full",
									item.done
										? "bg-primary text-primary-foreground"
										: "border border-dashed border-white/30 text-white/35",
								)}
							>
								{item.done ? (
									<Check className="size-3 stroke-[3]" />
								) : (
									<span className="size-1.5 rounded-full bg-white/35" />
								)}
							</span>
							<span
								className={cn(
									"text-sm",
									item.done ? "font-medium text-white" : "text-white/45",
								)}
							>
								{item.label}
							</span>
						</motion.div>
					))}
				</div>
			</div>
		</div>
	);
}

function LiveScene({
	reduce,
	t,
}: {
	reduce: boolean;
	t: HomeT;
}) {
	return (
		<div className="relative w-full max-w-[320px]">
			{!reduce &&
				[0, 1, 2].map((i) => (
					<motion.span
						key={i}
						aria-hidden
						className="absolute left-1/2 top-8 size-1.5 rounded-full bg-amber-300"
						animate={{
							y: [0, 90],
							x: [0, (i - 1) * 36],
							opacity: [0, 1, 0],
							scale: [0.6, 1, 0.4],
						}}
						transition={{
							duration: 1.6,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeOut",
							delay: 0.35 * i,
							repeatDelay: 0.7,
						}}
					/>
				))}

			<motion.div
				initial={reduce ? false : { opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45, ease: EASE }}
				className="overflow-hidden rounded-2xl border border-white/12 bg-black/35 shadow-2xl shadow-black/40 backdrop-blur-sm"
			>
				<div className="flex items-center gap-2 border-b border-white/10 px-3.5 py-2.5">
					<span className="inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
						{t("animPosted")}
					</span>
					<span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary/20 text-primary">
						<CheckCircle2 className="size-3.5" />
					</span>
				</div>
				<div className="p-4">
					<p className="text-sm font-semibold tracking-tight text-white">
						{t("animJobTitleValue")}
					</p>
					<p className="mt-1 text-xs text-white/50">{t("animJobMeta")}</p>
				</div>
			</motion.div>

			<motion.div
				initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ delay: 0.35, duration: 0.45, ease: EASE }}
				className="mt-3 flex items-center gap-3 rounded-2xl bg-[#229ED9] px-3.5 py-3 text-white shadow-[0_16px_36px_-14px_rgba(34,158,217,0.7)]"
			>
				<span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
					<motion.span
						animate={reduce ? undefined : { x: [0, 3, 0] }}
						transition={{
							duration: 1.4,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
					>
						<Send className="size-4" />
					</motion.span>
				</span>
				<div className="min-w-0 flex-1">
					<p className="text-[10px] font-medium uppercase tracking-wide text-white/80">
						{t("animSentToTelegram")}
					</p>
					<p className="truncate text-sm font-semibold">
						{t("animTelegramTopic")}
					</p>
				</div>
			</motion.div>
		</div>
	);
}

function StepVisual({
	stepId,
	reduce,
}: {
	stepId: StepId;
	reduce: boolean;
}) {
	const t = useTranslations("home");

	return (
		<div className="relative flex h-full min-h-[280px] items-center justify-center overflow-hidden bg-brand-deep p-5 sm:min-h-[340px] sm:p-6 md:min-h-[380px]">
			<StageGlow reduce={reduce} />

			<AnimatePresence mode="wait">
				<motion.div
					key={stepId}
					variants={scene}
					initial="initial"
					animate="animate"
					exit="exit"
					transition={{ duration: 0.45, ease: EASE }}
					className="relative z-10 flex w-full justify-center"
				>
					{stepId === "account" && (
						<AccountScene reduce={reduce} t={t as HomeT} />
					)}
					{stepId === "details" && (
						<DetailsScene reduce={reduce} t={t as HomeT} />
					)}
					{stepId === "payment" && (
						<PaymentScene reduce={reduce} t={t as HomeT} />
					)}
					{stepId === "review" && (
						<ReviewScene reduce={reduce} t={t as HomeT} />
					)}
					{stepId === "live" && <LiveScene reduce={reduce} t={t as HomeT} />}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

export function JobPostStepsSection() {
	const reduceMotion = useReducedMotion();
	const t = useTranslations("home");
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
		if (
			typeof window !== "undefined" &&
			window.matchMedia("(max-width: 1023px)").matches
		) {
			return;
		}
		stepRefs.current[active]?.scrollIntoView({
			behavior: reduceMotion ? "auto" : "smooth",
			block: "nearest",
		});
	}, [active, reduceMotion]);

	const step = STEPS[active];
	const Icon = step.icon;
	const stepTitle = t(step.titleKey);

	return (
		<MotionSection
			className="relative border-b bg-background pt-8 pb-14 sm:pt-10 sm:pb-20 md:pt-14 md:pb-28"
			delay={0}
		>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,var(--primary)/0.06,transparent_65%)]"
			/>

			<div
				ref={sectionRef}
				className="container relative mx-auto max-w-6xl px-4 sm:px-6"
			>
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, ease: EASE }}
					className="mx-auto mb-8 max-w-2xl text-center sm:mb-12 md:mb-14"
				>
					<p className="text-[11px] font-semibold uppercase tracking-widest text-primary sm:text-sm">
						{t("howItWorks")}
					</p>
					<h2 className="mt-2 text-balance text-2xl font-bold tracking-tight sm:mt-3 sm:text-3xl md:text-4xl">
						{t("stepsTitle")}
					</h2>
					<p className="mt-3 text-pretty text-sm text-muted-foreground sm:mt-4 sm:text-base md:text-lg">
						{t("stepsSubtitle")}
					</p>
				</motion.div>

				<div className="grid overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl shadow-black/5 sm:rounded-[1.75rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:rounded-[2rem]">
					<div className="relative order-1 border-b lg:order-2 lg:border-b-0">
						<div className="relative">
							<div className="flex items-center gap-2.5 border-b border-white/10 bg-brand-deep px-3 py-2.5 sm:px-5 sm:py-3">
								<AnimatePresence mode="wait">
									<motion.div
										key={step.id}
										initial={{ opacity: 0, y: 4 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -4 }}
										transition={{ duration: 0.25, ease: EASE }}
										className="flex min-w-0 items-center gap-2.5"
									>
										<span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:size-8">
											<Icon className="size-3.5 sm:size-4" />
										</span>
										<div className="min-w-0">
											<p className="text-[10px] font-medium uppercase tracking-wider text-white/45">
												{t("stepsOf", {
													current: active + 1,
													total: STEPS.length,
												})}
											</p>
											<p className="truncate text-xs font-semibold text-white sm:text-sm">
												{stepTitle}
											</p>
										</div>
									</motion.div>
								</AnimatePresence>
							</div>
							<StepVisual stepId={step.id} reduce={!!reduceMotion} />
						</div>
					</div>

					<div className="order-2 min-w-0 p-4 sm:p-5 md:p-6 lg:order-1 lg:max-h-[560px] lg:overflow-y-auto lg:border-r">
						<div className="mb-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
							{STEPS.map((s, i) => {
								const isActive = i === active;
								return (
									<button
										key={`chip-${s.id}`}
										type="button"
										onClick={() => goTo(i)}
										aria-current={isActive ? "step" : undefined}
										aria-label={t("stepsGoTo", {
											n: i + 1,
											title: t(s.titleKey),
										})}
										className={cn(
											"flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors",
											isActive
												? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
												: "bg-muted text-muted-foreground",
										)}
									>
										<span className="tabular-nums">{s.number}</span>
										{isActive ? (
											<span className="max-w-[9.5rem] truncate">
												{t(s.titleKey)}
											</span>
										) : null}
									</button>
								);
							})}
						</div>

						<div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
							<p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
								{t("stepsOf", { current: active + 1, total: STEPS.length })}
							</p>
							<div className="flex min-w-0 flex-1 items-center gap-2">
								{!reduceMotion && (
									<motion.span
										key={active}
										initial={{ scaleX: 0 }}
										animate={{ scaleX: 1 }}
										transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
										className="h-1 max-w-24 flex-1 origin-left rounded-full bg-primary sm:max-w-32"
									/>
								)}
								<span className="shrink-0 text-[10px] font-medium text-primary">
									{t("stepsAuto")}
								</span>
							</div>
						</div>

						<div className="lg:hidden">
							<div className="rounded-2xl bg-primary/10 p-3.5 ring-1 ring-primary/20 sm:p-4">
								<p className="font-semibold leading-snug">{stepTitle}</p>
								<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
									{t(step.bodyKey)}
								</p>
							</div>
						</div>

						<ol className="hidden space-y-1 lg:block">
							{STEPS.map((s, i) => {
								const StepIcon = s.icon;
								const isActive = i === active;
								const title = t(s.titleKey);
								const description = t(s.bodyKey);
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
													"flex w-full items-start gap-3 rounded-xl px-3 py-2 transition-colors",
													isActive
														? "bg-primary/10 ring-1 ring-primary/20"
														: "opacity-60 hover:opacity-90",
												)}
											>
												<span
													className={cn(
														"flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
														isActive
															? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
															: "bg-muted text-muted-foreground",
													)}
												>
													{isActive ? (
														<StepIcon className="size-4" />
													) : (
														s.number
													)}
												</span>
												<div className="min-w-0 pt-0.5">
													<p
														className={cn(
															"text-sm font-semibold leading-snug",
															isActive
																? "text-foreground"
																: "text-muted-foreground",
														)}
													>
														{title}
													</p>
													<AnimatePresence>
														{isActive && (
															<motion.p
																initial={{ opacity: 0, height: 0 }}
																animate={{ opacity: 1, height: "auto" }}
																exit={{ opacity: 0, height: 0 }}
																transition={{ duration: 0.35, ease: EASE }}
																className="mt-0.5 overflow-hidden text-xs leading-relaxed text-muted-foreground"
															>
																{description}
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
							className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:flex-wrap sm:gap-2.5"
						>
							<Button asChild className="h-11 w-full rounded-full sm:w-auto">
								<Link href="/post/new">
									{t("ctaPost")} <ArrowRight className="size-4" />
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								className="h-11 w-full rounded-full sm:w-auto"
							>
								<Link href="/pricing">{t("stepsViewPricing")}</Link>
							</Button>
						</motion.div>
					</div>
				</div>

				<div className="mt-6 flex justify-center gap-2 sm:mt-8">
					{STEPS.map((s, i) => (
						<button
							key={s.id}
							type="button"
							aria-label={t("stepsGoTo", { n: i + 1, title: t(s.titleKey) })}
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
