"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Briefcase } from "lucide-react";
import {
	AnimatePresence,
	motion,
	useMotionValue,
	useReducedMotion,
	useTransform,
	animate,
} from "framer-motion";
import { DEFAULT_APP_NAME } from "@/lib/env";

const INTRO_KEY = "mak-advert-intro-v4";
const BUILD_MS = 3000;
const HOLD_MS = 600;
const EXIT_MS = 1000;

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_EXIT = [0.76, 0, 0.24, 1] as const;

function IntroLoader({ onComplete }: { onComplete: () => void }) {
	const reduceMotion = useReducedMotion();
	const doneRef = useRef(onComplete);
	doneRef.current = onComplete;
	const [phase, setPhase] = useState<"build" | "exit">("build");
	const progress = useMotionValue(0);
	const progressWidth = useTransform(progress, (v) => `${v}%`);
	const progressLabel = useTransform(progress, (v) => `${Math.round(v)}`);

	const letters = useMemo(
		() => DEFAULT_APP_NAME.split("").map((ch, i) => ({ ch, i })),
		[],
	);

	const particles = useMemo(
		() =>
			Array.from({ length: 20 }, (_, i) => ({
				id: i,
				x: 6 + ((i * 41) % 88),
				y: 8 + ((i * 59) % 84),
				size: 2 + (i % 3),
				delay: (i % 8) * 0.16,
				dur: 3.2 + (i % 5) * 0.5,
			})),
		[],
	);

	useEffect(() => {
		if (reduceMotion) {
			doneRef.current();
			return;
		}

		const ctrl = animate(progress, 100, {
			duration: BUILD_MS / 1000,
			ease: [0.4, 0, 0.2, 1],
		});

		const exitTimer = window.setTimeout(
			() => setPhase("exit"),
			BUILD_MS + HOLD_MS,
		);
		const doneTimer = window.setTimeout(
			() => doneRef.current(),
			BUILD_MS + HOLD_MS + EXIT_MS,
		);

		return () => {
			ctrl.stop();
			window.clearTimeout(exitTimer);
			window.clearTimeout(doneTimer);
		};
	}, [progress, reduceMotion]);

	if (reduceMotion) return null;

	return (
		<motion.div
			className="fixed inset-0 z-100 overflow-hidden bg-brand-deep"
			aria-hidden
			initial={{ clipPath: "circle(150% at 50% 45%)" }}
			animate={
				phase === "exit"
					? { clipPath: "circle(0% at 50% 45%)" }
					: { clipPath: "circle(150% at 50% 45%)" }
			}
			transition={{ duration: EXIT_MS / 1000, ease: EASE_EXIT }}
		>
			{/* Aurora */}
			<motion.div
				className="pointer-events-none absolute -left-1/4 top-[-20%] size-[70vmax] rounded-full bg-sky-400/20 blur-[100px]"
				animate={{ x: [0, 40, 0], y: [0, 30, 0], opacity: [0.35, 0.55, 0.35] }}
				transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
			/>
			<motion.div
				className="pointer-events-none absolute -right-1/4 bottom-[-10%] size-[55vmax] rounded-full bg-blue-500/25 blur-[110px]"
				animate={{ x: [0, -30, 0], y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
				transition={{
					duration: 7,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
					delay: 0.4,
				}}
			/>

			{/* Perspective grid */}
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.14]"
				style={{
					backgroundImage:
						"linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
					backgroundSize: "52px 52px",
					maskImage:
						"radial-gradient(ellipse 65% 55% at 50% 42%, black, transparent)",
				}}
			/>

			{/* Particles */}
			{particles.map((p) => (
				<motion.span
					key={p.id}
					className="pointer-events-none absolute rounded-full bg-sky-200/75"
					style={{
						left: `${p.x}%`,
						top: `${p.y}%`,
						width: p.size,
						height: p.size,
					}}
					initial={{ opacity: 0, scale: 0 }}
					animate={{
						opacity: [0, 0.95, 0],
						y: [0, -30, -55],
						scale: [0.3, 1, 0.15],
					}}
					transition={{
						duration: p.dur,
						delay: p.delay,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeOut",
					}}
				/>
			))}

			{/* Horizontal scan */}
			<motion.div
				className="pointer-events-none absolute inset-x-0 z-20 h-px bg-linear-to-r from-transparent via-sky-300/80 to-transparent"
				initial={{ top: "115%", opacity: 0 }}
				animate={{ top: ["115%", "-8%"], opacity: [0, 1, 0] }}
				transition={{ duration: 2.2, delay: 0.25, ease: "easeInOut" }}
			/>

			<div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
				{/* Orbital mark */}
				<div className="relative mb-10 flex size-28 items-center justify-center sm:size-32">
					<motion.span
						className="absolute inset-0 rounded-full border border-sky-300/30"
						initial={{ scale: 0.55, opacity: 0 }}
						animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.75, 0.4] }}
						transition={{
							duration: 2.6,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
					/>
					<motion.span
						className="absolute inset-[-12px] rounded-full border border-dashed border-sky-100/35"
						initial={{ opacity: 0 }}
						animate={{ rotate: 360, opacity: 1 }}
						transition={{
							rotate: { duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
							opacity: { duration: 0.6 },
						}}
					/>
					<motion.span
						className="absolute inset-[-26px] rounded-full border border-sky-400/20"
						initial={{ scale: 0.7, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.9, ease: EASE }}
					/>
					<motion.div
						className="relative flex size-16 items-center justify-center rounded-2xl bg-white text-brand-deep shadow-[0_0_50px_rgba(56,189,248,0.55)] sm:size-[4.5rem]"
						initial={{ scale: 0.35, opacity: 0, rotate: -16 }}
						animate={{ scale: 1, opacity: 1, rotate: 0 }}
						transition={{ duration: 0.85, delay: 0.12, ease: EASE }}
					>
						<Briefcase className="size-7 sm:size-8" strokeWidth={2.25} />
						<motion.span
							className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-sky-300/50"
							animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.06, 1] }}
							transition={{
								duration: 1.8,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
							}}
						/>
					</motion.div>
				</div>

				<motion.p
					className="text-[11px] font-semibold uppercase tracking-[0.42em] text-sky-200/90"
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.65, delay: 0.4, ease: EASE }}
				>
					Welcome to
				</motion.p>

				<h1 className="mt-4 flex flex-wrap justify-center gap-x-[0.08em] text-center text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
					{letters.map(({ ch, i }) =>
						ch === " " ? (
							<span key={`sp-${i}`} className="inline-block w-[0.32em]" />
						) : (
							<span
								key={`${ch}-${i}`}
								className="inline-block overflow-hidden pb-1"
							>
								<motion.span
									className="inline-block bg-linear-to-b from-white via-white to-sky-200/80 bg-clip-text text-transparent"
									initial={{ y: "120%", opacity: 0, rotateX: 40 }}
									animate={{ y: 0, opacity: 1, rotateX: 0 }}
									transition={{
										duration: 0.75,
										delay: 0.55 + i * 0.048,
										ease: EASE,
									}}
								>
									{ch}
								</motion.span>
							</span>
						),
					)}
				</h1>

				<motion.p
					className="mt-5 max-w-md text-center text-sm text-white/55 sm:text-base"
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.65, delay: 1.6, ease: EASE }}
				>
					Jobs & adverts across Ethiopia
				</motion.p>

				{/* Load meter */}
				<div className="mt-12 w-full max-w-[240px]">
					<div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-100/75">
						<span>Booting board</span>
						<span className="tabular-nums">
							<motion.span>{progressLabel}</motion.span>%
						</span>
					</div>
					<div className="relative h-[3px] overflow-hidden rounded-full bg-white/12">
						<motion.div
							className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-sky-400 via-white to-sky-200"
							style={{ width: progressWidth }}
						/>
						<motion.div
							className="absolute inset-y-0 w-16 bg-linear-to-r from-transparent via-white/70 to-transparent"
							animate={{ left: ["-20%", "120%"] }}
							transition={{
								duration: 1.4,
								repeat: Number.POSITIVE_INFINITY,
								ease: "linear",
							}}
						/>
					</div>
				</div>
			</div>
		</motion.div>
	);
}

export function PublicIntroGate({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const reduceMotion = useReducedMotion();
	const isHome = pathname === "/";
	const [showIntro, setShowIntro] = useState(false);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		setReady(true);
		if (!isHome || reduceMotion) return;
		if (!sessionStorage.getItem(INTRO_KEY)) setShowIntro(true);
	}, [isHome, reduceMotion]);

	const handleComplete = useCallback(() => {
		sessionStorage.setItem(INTRO_KEY, "1");
		setShowIntro(false);
	}, []);

	if (!ready && isHome) {
		return <div className="min-h-screen bg-brand-deep" aria-hidden />;
	}

	return (
		<>
			{children}
			<AnimatePresence>
				{showIntro && <IntroLoader onComplete={handleComplete} />}
			</AnimatePresence>
		</>
	);
}
