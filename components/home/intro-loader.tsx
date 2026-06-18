"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DEFAULT_APP_NAME } from "@/lib/env";

const INTRO_KEY = "mak-advert-intro-v3";
/** Last text finishes ~3.2s after mount; curtain waits until then + extra hold */
const REVEAL_MS = 3200;
const HOLD_AFTER_REVEAL_MS = 4000;
const EXIT_MS = 1500;

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_CURTAIN = [0.76, 0, 0.24, 1] as const;

function IntroLoader({ onComplete }: { onComplete: () => void }) {
	const reduceMotion = useReducedMotion();
	const doneRef = useRef(onComplete);
	doneRef.current = onComplete;
	const [phase, setPhase] = useState<"in" | "out">("in");

	useEffect(() => {
		if (reduceMotion) {
			doneRef.current();
			return;
		}
		const exitAt = REVEAL_MS + HOLD_AFTER_REVEAL_MS;
		const exitTimer = window.setTimeout(() => setPhase("out"), exitAt);
		const doneTimer = window.setTimeout(
			() => doneRef.current(),
			exitAt + EXIT_MS,
		);
		return () => {
			window.clearTimeout(exitTimer);
			window.clearTimeout(doneTimer);
		};
	}, [reduceMotion]);

	if (reduceMotion) return null;

	const [first, ...rest] = DEFAULT_APP_NAME.split(/\s+/);
	const second = rest.join(" ");

	return (
		<motion.div
			className="fixed inset-0 z-100 overflow-hidden bg-brand-deep"
			initial={{ y: 0 }}
			animate={phase === "out" ? { y: "-100%" } : { y: 0 }}
			transition={{ duration: EXIT_MS / 1000, ease: EASE_CURTAIN }}
			aria-hidden
		>
			{/* Soft ambient light — static, no pulsing */}
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse 80% 55% at 50% 40%, rgba(56,189,248,0.2), transparent 70%)",
				}}
			/>

			<div className="flex h-full flex-col items-center justify-center px-6">
				<div className="relative text-center">
					{/* Accent line */}
					<motion.div
						className="mx-auto mb-8 h-px w-16 bg-linear-to-r from-transparent via-sky-300 to-transparent sm:w-24"
						initial={{ scaleX: 0, opacity: 0 }}
						animate={{ scaleX: 1, opacity: 1 }}
						transition={{ duration: 1.2, ease: EASE_OUT }}
					/>

					<div className="overflow-hidden">
						<motion.p
							className="text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-200/80"
							initial={{ y: 24, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.9, delay: 0.5, ease: EASE_OUT }}
						>
							Welcome to
						</motion.p>
					</div>

					<div className="mt-3 overflow-hidden">
						<motion.h1
							className="text-5xl font-bold leading-none tracking-tight text-white sm:text-6xl md:text-7xl"
							initial={{ y: "110%" }}
							animate={{ y: 0 }}
							transition={{ duration: 1.1, delay: 1.1, ease: EASE_OUT }}
						>
							{first}
						</motion.h1>
					</div>

					{second && (
						<div className="mt-1 overflow-hidden">
							<motion.p
								className="bg-linear-to-r from-sky-200 via-white to-blue-200 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl"
								initial={{ y: "110%" }}
								animate={{ y: 0 }}
								transition={{ duration: 1.1, delay: 1.75, ease: EASE_OUT }}
							>
								{second}
							</motion.p>
						</div>
					)}

					<motion.p
						className="mt-6 text-sm text-white/50 sm:text-base"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.9, delay: 2.5, ease: EASE_OUT }}
					>
						Jobs & adverts across Ethiopia
					</motion.p>
				</div>
			</div>

			{/* Bottom edge shine */}
			<motion.div
				className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/20"
				initial={{ scaleX: 0 }}
				animate={{ scaleX: 1 }}
				transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT }}
			/>
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
			<AnimatePresence>{showIntro && <IntroLoader onComplete={handleComplete} />}</AnimatePresence>
		</>
	);
}
