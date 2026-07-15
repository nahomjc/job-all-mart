"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { HeroPhoneMockup } from "@/components/home/hero-phone-mockup";
import { EASE } from "@/components/home/motion";
import { Button } from "@/components/ui/button";
import { DEFAULT_APP_NAME } from "@/lib/env";

const TRUSTED_BRANDS = [
	"Ethiopian Airlines",
	"Commercial Bank of Ethiopia",
	"Ethio Telecom",
	"Dashen Bank",
	"Awash Bank",
	"Safaricom Ethiopia",
];

const fadeUp = {
	hidden: { opacity: 0, y: 40 },
	show: (i: number) => ({
		opacity: 1,
		y: 0,
		transition: { duration: 0.7, delay: i * 0.1, ease: EASE },
	}),
};

function BrandMarquee() {
	const items = [
		...TRUSTED_BRANDS.map((brand) => ({ id: `${brand}-first`, brand })),
		...TRUSTED_BRANDS.map((brand) => ({ id: `${brand}-second`, brand })),
	];
	return (
		<div className="relative overflow-hidden border-t border-amber-200/60 bg-white/50 py-5 backdrop-blur-sm">
			<div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-[#fff9eb] to-transparent" />
			<div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-[#fff9eb] to-transparent" />
			<motion.div
				className="flex w-max gap-16 px-8"
				animate={{ x: ["0%", "-50%"] }}
				transition={{ duration: 28, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
			>
				{items.map(({ id, brand }) => (
					<span
						key={id}
						className="text-base font-bold tracking-tight text-stone-600 md:text-lg"
					>
						{brand}
					</span>
				))}
			</motion.div>
		</div>
	);
}

function HeroParticles({ reduce }: { reduce: boolean }) {
	if (reduce) return null;
	const dots = Array.from({ length: 12 }, (_, i) => i);
	return (
		<div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
			{dots.map((i) => (
				<motion.span
					key={i}
					className="absolute size-1 rounded-full bg-amber-500/50"
					style={{
						left: `${8 + (i * 7) % 85}%`,
						top: `${10 + (i * 11) % 80}%`,
					}}
					animate={{
						opacity: [0.2, 0.9, 0.2],
						scale: [1, 1.8, 1],
						y: [0, -20 - i * 3, 0],
					}}
					transition={{
						duration: 3 + (i % 4),
						repeat: Number.POSITIVE_INFINITY,
						delay: i * 0.25,
						ease: "easeInOut",
					}}
				/>
			))}
		</div>
	);
}

type HeroSectionProps = {
	telegramJoinUrl: string;
	appName?: string;
};

export function HeroSection({
	telegramJoinUrl,
	appName = DEFAULT_APP_NAME,
}: HeroSectionProps) {
	const reduceMotion = useReducedMotion();

	return (
		<section className="relative isolate min-h-[90vh] overflow-hidden bg-[#fff9eb] text-stone-900">
			{/* Soft warm wash — matches site cream, not muddy brown */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse 80% 55% at 70% 20%, rgba(245,215,110,0.55), transparent 55%), radial-gradient(ellipse 60% 50% at 10% 80%, rgba(250,230,160,0.45), transparent 50%), linear-gradient(165deg, #fffdf5 0%, #fff6d9 42%, #f5e7b8 100%)",
				}}
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-soft-light"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
				}}
			/>
			<HeroParticles reduce={!!reduceMotion} />

			<motion.div
				aria-hidden
				className="pointer-events-none absolute left-[-20%] top-[-15%] h-[70%] w-[70%] rounded-full bg-amber-300/40 blur-[110px]"
				animate={
					reduceMotion
						? undefined
						: { x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.08, 1] }
				}
				transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
			/>
			<motion.div
				aria-hidden
				className="pointer-events-none absolute right-[-15%] bottom-[-15%] h-[60%] w-[55%] rounded-full bg-yellow-200/50 blur-[100px]"
				animate={
					reduceMotion ? undefined : { x: [0, -35, 0], y: [0, 25, 0] }
				}
				transition={{ duration: 13, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
			/>

			<div className="container relative mx-auto flex min-h-[85vh] flex-col justify-center px-4 pb-8 pt-24 md:pt-28">
				<div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
					<div className="relative z-10 text-center lg:text-left">
						<motion.span
							custom={0}
							variants={fadeUp}
							initial="hidden"
							animate="show"
							className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-white/70 px-4 py-1.5 text-xs font-medium text-stone-700 shadow-sm backdrop-blur-md"
						>
							<Sparkles className="size-3.5 text-amber-600" />
							Live on Telegram and the web
						</motion.span>

						<motion.h1
							custom={1}
							variants={fadeUp}
							initial="hidden"
							animate="show"
							className="mt-7 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-stone-900 md:text-6xl lg:text-[4rem]"
						>
							Post jobs.
							<br />
							<motion.span
								className="bg-linear-to-r from-amber-700 via-yellow-600 to-amber-500 bg-clip-text text-transparent"
								animate={
									reduceMotion
										? undefined
										: { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
								}
								transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
								style={{ backgroundSize: "200% auto" }}
							>
								Publish on Telegram.
							</motion.span>
						</motion.h1>

						<motion.p
							custom={2}
							variants={fadeUp}
							initial="hidden"
							animate="show"
							className="mx-auto mt-6 max-w-lg text-pretty text-lg leading-relaxed text-stone-600 lg:mx-0"
						>
							Post jobs on {appName}, get them reviewed by our team, then
							publish to Telegram and the website.
						</motion.p>

						<motion.div
							custom={3}
							variants={fadeUp}
							initial="hidden"
							animate="show"
							className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
						>
							<motion.div
								whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(120,90,20,0.25)" }}
								whileTap={{ scale: 0.97 }}
							>
								<Button
									asChild
									size="lg"
									className="h-14 rounded-full bg-brand-deep px-12 text-base font-bold text-white shadow-xl shadow-amber-900/20 hover:bg-brand-deep/90"
								>
									<Link href="/jobs">Get Started</Link>
								</Button>
							</motion.div>
							<Button
								asChild
								variant="ghost"
								className="h-12 text-stone-700 hover:bg-amber-100/80 hover:text-stone-900"
							>
								<Link href="/post/new">
									Post a job <ArrowRight className="size-4" />
								</Link>
							</Button>
						</motion.div>

						<motion.div
							custom={4}
							variants={fadeUp}
							initial="hidden"
							animate="show"
							className="mt-12 flex flex-col items-center gap-4 lg:items-start"
						>
							<div className="flex items-center gap-4">
								<div className="flex -space-x-3">
									{["bg-amber-400", "bg-yellow-500", "bg-amber-500", "bg-yellow-600"].map(
										(bg, i) => (
											<motion.span
												key={bg}
												initial={{ opacity: 0, scale: 0, x: -10 }}
												animate={{ opacity: 1, scale: 1, x: 0 }}
												transition={{ delay: 0.6 + i * 0.08, type: "spring" }}
												whileHover={{ y: -4, zIndex: 10 }}
												className={`flex size-11 items-center justify-center rounded-full border-[3px] border-white ${bg} text-xs font-bold text-stone-900 shadow-lg`}
											>
												{String.fromCharCode(65 + i)}
											</motion.span>
										),
									)}
								</div>
								<p className="text-left text-sm font-medium text-stone-600">
									<span className="text-lg font-bold text-stone-900">250K+</span>
									<br />
									people have joined
								</p>
							</div>
							<Button
								asChild
								variant="link"
								className="h-auto p-0 text-stone-600 hover:text-stone-900"
							>
								<a href={telegramJoinUrl} target="_blank" rel="noopener noreferrer">
									<MessageSquare className="size-3.5" />
									Or use the Telegram bot
								</a>
							</Button>
						</motion.div>
					</div>

					<HeroPhoneMockup appName={appName} />
				</div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1.2 }}
					className="mt-8 flex justify-center lg:hidden"
				>
					<motion.div
						animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
						transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
						className="flex flex-col items-center gap-2 text-stone-400"
					>
						<span className="text-xs">Scroll down</span>
						<span className="h-8 w-px bg-linear-to-b from-stone-400/60 to-transparent" />
					</motion.div>
				</motion.div>
			</div>

			<BrandMarquee />
		</section>
	);
}
