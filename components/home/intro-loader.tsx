"use client";

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BrandLogo } from "@/components/brand-logo";
import { EASE } from "@/components/home/motion";
import { DEFAULT_APP_NAME } from "@/lib/env";

const INTRO_KEY = "mak-advert-intro-v7";
const BUILD_MS = 2800;
const HOLD_MS = 600;
const EXIT_MS = 900;

const EASE_LUXE = [0.16, 1, 0.3, 1] as const;

function subscribeNoop() {
	return () => {};
}

function useIsClient() {
	return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

function IntroLoader({ onComplete }: { onComplete: () => void }) {
	const reduceMotion = useReducedMotion();
	const [phase, setPhase] = useState<"in" | "out">("in");
	const onCompleteRef = useRef(onComplete);

	useEffect(() => {
		onCompleteRef.current = onComplete;
	}, [onComplete]);

	useEffect(() => {
		if (reduceMotion) {
			onCompleteRef.current();
			return;
		}

		const exitTimer = window.setTimeout(
			() => setPhase("out"),
			BUILD_MS + HOLD_MS,
		);
		const doneTimer = window.setTimeout(
			() => onCompleteRef.current(),
			BUILD_MS + HOLD_MS + EXIT_MS,
		);

		return () => {
			window.clearTimeout(exitTimer);
			window.clearTimeout(doneTimer);
		};
	}, [reduceMotion]);

	if (reduceMotion) return null;

	const nameParts = DEFAULT_APP_NAME.split(" ");
	const primary = nameParts[0] ?? "MAK";
	const rest = nameParts.slice(1).join(" ");
	const letters = primary.split("").map((letter, index) => {
		const occurrence = primary.slice(0, index + 1).split(letter).length - 1;
		return { letter, id: `${letter}${occurrence}` };
	});

	return (
		<motion.div
			className="fixed inset-0 z-100 overflow-hidden bg-[#070605]"
			aria-hidden
			initial={{ opacity: 1 }}
			animate={phase === "out" ? { opacity: 0 } : { opacity: 1 }}
			transition={{ duration: EXIT_MS / 1000, ease: EASE_LUXE }}
		>
			{/* Deep stage */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse 50% 42% at 50% 48%, rgba(212,175,55,0.14), transparent 68%), radial-gradient(ellipse 80% 55% at 50% 110%, rgba(0,0,0,0.95), transparent 50%)",
				}}
			/>

			{/* Soft vignette */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse 70% 70% at 50% 50%, transparent 35%, rgba(0,0,0,0.72) 100%)",
				}}
			/>

			{/* Fine grain */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-overlay"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
				}}
			/>

			{/* Curtain exit panels */}
			<motion.div
				aria-hidden
				className="absolute inset-x-0 top-0 z-20 h-1/2 origin-top bg-[#070605]"
				initial={{ scaleY: 0 }}
				animate={phase === "out" ? { scaleY: 1 } : { scaleY: 0 }}
				transition={{ duration: EXIT_MS / 1000, ease: EASE_LUXE }}
			/>
			<motion.div
				aria-hidden
				className="absolute inset-x-0 bottom-0 z-20 h-1/2 origin-bottom bg-[#070605]"
				initial={{ scaleY: 0 }}
				animate={phase === "out" ? { scaleY: 1 } : { scaleY: 0 }}
				transition={{ duration: EXIT_MS / 1000, ease: EASE_LUXE }}
			/>

			<motion.div
				className="relative z-10 flex h-full flex-col items-center justify-center px-6"
				animate={
					phase === "out"
						? { opacity: 0, scale: 0.97, filter: "blur(4px)" }
						: { opacity: 1, scale: 1, filter: "blur(0px)" }
				}
				transition={{ duration: (EXIT_MS / 1000) * 0.65, ease: EASE }}
			>
				{/* Crest */}
				<div className="relative flex size-28 items-center justify-center sm:size-32">
					{/* Outer thin ring */}
					<svg
						className="absolute inset-0 size-full -rotate-90"
						viewBox="0 0 100 100"
						fill="none"
						aria-hidden
						focusable="false"
					>
						<title>Brand mark ring</title>
						<circle
							cx="50"
							cy="50"
							r="47.5"
							stroke="rgba(212,175,55,0.12)"
							strokeWidth="0.6"
						/>
						<motion.circle
							cx="50"
							cy="50"
							r="47.5"
							stroke="rgba(212,175,55,0.9)"
							strokeWidth="0.75"
							strokeLinecap="round"
							strokeDasharray={298.5}
							initial={{ strokeDashoffset: 298.5 }}
							animate={{ strokeDashoffset: 0 }}
							transition={{ duration: 1.35, delay: 0.2, ease: EASE_LUXE }}
						/>
					</svg>

					{/* Soft gold bloom behind logo */}
					<motion.div
						aria-hidden
						className="absolute inset-[18%] rounded-full bg-[#d4af37]/20 blur-2xl"
						initial={{ opacity: 0, scale: 0.6 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 1.2, delay: 0.25, ease: EASE_LUXE }}
					/>

					<motion.div
						initial={{ opacity: 0, scale: 0.86, y: 8 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						transition={{ duration: 1, delay: 0.4, ease: EASE_LUXE }}
						className="relative"
					>
						<BrandLogo
							size={88}
							priority
							className="shadow-[0_0_0_1px_rgba(212,175,55,0.2),0_18px_50px_-18px_rgba(212,175,55,0.55)] ring-1 ring-white/5 sm:shadow-[0_0_0_1px_rgba(212,175,55,0.22),0_22px_60px_-16px_rgba(212,175,55,0.6)]"
						/>
					</motion.div>
				</div>

				{/* Wordmark */}
				<div className="mt-10 overflow-hidden sm:mt-12">
					<h1 className="flex items-baseline justify-center gap-[0.28em] text-[2rem] font-semibold tracking-[-0.04em] text-white sm:text-[2.75rem]">
						<span className="inline-flex">
							{letters.map(({ letter, id }, i) => (
								<motion.span
									key={id}
									className="inline-block bg-linear-to-b from-[#f5e6a8] via-[#d4af37] to-[#a88420] bg-clip-text text-transparent"
									initial={{ y: "115%", opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{
										duration: 0.7,
										delay: 0.85 + i * 0.05,
										ease: EASE_LUXE,
									}}
								>
									{letter}
								</motion.span>
							))}
						</span>
						{rest ? (
							<motion.span
								className="font-medium tracking-[-0.03em] text-white/88"
								initial={{ y: "115%", opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.75, delay: 1.05, ease: EASE_LUXE }}
							>
								{rest}
							</motion.span>
						) : null}
					</h1>
				</div>

				{/* Gold rule */}
				<motion.div
					className="mt-7 flex h-px w-36 items-center justify-center sm:mt-8 sm:w-44"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.4, delay: 1.25 }}
				>
					<motion.span
						className="h-px w-full origin-center bg-linear-to-r from-transparent via-[#d4af37] to-transparent"
						initial={{ scaleX: 0 }}
						animate={{ scaleX: 1 }}
						transition={{ duration: 0.9, delay: 1.3, ease: EASE_LUXE }}
					/>
				</motion.div>

				<motion.p
					className="mt-5 text-center text-[10px] font-medium uppercase tracking-[0.32em] text-white/40 sm:mt-6 sm:text-[11px] sm:tracking-[0.36em]"
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 1.5, ease: EASE_LUXE }}
				>
					Jobs &amp; adverts · Ethiopia
				</motion.p>

				{/* Progress hairline */}
				<div className="absolute inset-x-0 bottom-10 flex justify-center px-8 sm:bottom-12">
					<div className="h-px w-full max-w-48 overflow-hidden rounded-full bg-white/8">
						<motion.div
							className="h-full origin-left bg-linear-to-r from-[#a88420] via-[#d4af37] to-[#f5e6a8]"
							initial={{ scaleX: 0 }}
							animate={{ scaleX: 1 }}
							transition={{
								duration: (BUILD_MS + HOLD_MS) / 1000,
								ease: "linear",
							}}
						/>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
}

function useIntroPending() {
	return useSyncExternalStore(
		subscribeNoop,
		() => !sessionStorage.getItem(INTRO_KEY),
		() => false,
	);
}

export function PublicIntroGate({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const reduceMotion = useReducedMotion();
	const isClient = useIsClient();
	const introPending = useIntroPending();
	const isHome = pathname === "/";
	const [dismissed, setDismissed] = useState(false);

	const showIntro =
		isClient && isHome && !reduceMotion && !dismissed && introPending;

	const handleComplete = useCallback(() => {
		sessionStorage.setItem(INTRO_KEY, "1");
		setDismissed(true);
	}, []);

	if (!isClient && isHome) {
		return <div className="min-h-screen bg-[#070605]" aria-hidden />;
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
