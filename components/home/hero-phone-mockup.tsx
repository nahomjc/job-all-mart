"use client";

import { Briefcase, MapPin, Search, Send, TrendingUp } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/components/home/motion";

function FloatingStat({
	delay,
	reduceMotion,
	className,
	children,
	initial,
}: {
	delay: number;
	reduceMotion: boolean;
	className: string;
	children: React.ReactNode;
	initial: { opacity: number; x?: number; y?: number };
}) {
	return (
		<motion.div
			initial={initial}
			animate={{ opacity: 1, x: 0, y: 0 }}
			transition={{ delay: 0.5 + delay, duration: 0.55, ease: EASE }}
			className={className}
		>
			<motion.div
				animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
				transition={{
					duration: 4.5 + delay,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
				}}
			>
				{children}
			</motion.div>
		</motion.div>
	);
}

type HeroPhoneMockupProps = {
	appName: string;
};

export function HeroPhoneMockup({ appName }: HeroPhoneMockupProps) {
	const reduceMotion = useReducedMotion();

	return (
		<div className="relative mx-auto h-[min(560px,72vh)] w-full max-w-[460px] lg:h-[580px] lg:max-w-none">
			{/* Glow ring */}
			<motion.div
				animate={
					reduceMotion
						? undefined
						: { scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }
				}
				transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
				className="pointer-events-none absolute left-1/2 top-1/2 size-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/30 blur-3xl sm:size-[320px]"
			/>

			<motion.div
				initial={{ opacity: 0, x: 60, rotate: 4 }}
				animate={{ opacity: 1, x: 0, rotate: 0 }}
				transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
				className="absolute inset-0 flex items-center justify-center"
			>
				<motion.div
					animate={reduceMotion ? undefined : { y: [0, -16, 0] }}
					transition={{
						duration: 5.5,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
					whileHover={reduceMotion ? undefined : { rotateY: 8, rotateX: -4 }}
					style={{ perspective: 1000 }}
					className="relative z-10"
				>
					<div className="relative w-[250px] rounded-[2.35rem] border-[3px] border-zinc-800 bg-zinc-900 p-2.5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] sm:w-[275px]">
						<div className="absolute left-1/2 top-2.5 z-20 h-5 w-28 -translate-x-1/2 rounded-full bg-zinc-950" />
						<div className="overflow-hidden rounded-[1.85rem] bg-[#f4f6f5]">
							<div className="flex items-center justify-between bg-white px-4 pb-2 pt-9 text-[10px] font-medium text-zinc-500">
								<span>9:41</span>
								<span className="flex gap-0.5">
									<span className="size-2 rounded-full bg-zinc-300" />
									<span className="size-2 rounded-full bg-zinc-800" />
								</span>
							</div>

							<div className="bg-white px-4 pb-3">
								<p className="text-xs text-zinc-500">Hello there 👋</p>
								<p className="text-base font-bold text-zinc-900">{appName}</p>
								<motion.div
									initial={{ scale: 0.95, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ delay: 0.6, duration: 0.4 }}
									className="mt-3 rounded-2xl bg-brand-deep p-3.5 text-white shadow-lg"
								>
									<p className="text-[10px] uppercase tracking-widest opacity-80">
										Live listings
									</p>
									<motion.p
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.9 }}
										className="text-3xl font-bold tracking-tight"
									>
										1,524
									</motion.p>
									<div className="mt-2.5 flex gap-2">
										<span className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-white/20 py-2 text-[10px] font-semibold">
											<Search className="size-3" />
											Browse
										</span>
										<span className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-white py-2 text-[10px] font-semibold text-brand-deep">
											<Send className="size-3" />
											Post job
										</span>
									</div>
								</motion.div>
							</div>

							<div className="space-y-2 bg-[#f4f6f5] px-3 py-3">
								{[
									{ title: "Senior Engineer", co: "TechCo", loc: "Remote" },
									{ title: "Product Designer", co: "Studio", loc: "Addis" },
								].map((job, i) => (
									<motion.div
										key={job.title}
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.7 + i * 0.15, ease: EASE }}
										className="flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white p-2.5 shadow-sm"
									>
										<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-brand-deep">
											<Briefcase className="size-3.5" />
										</span>
										<div className="min-w-0 flex-1">
											<p className="truncate text-[11px] font-semibold text-zinc-900">
												{job.title}
											</p>
											<p className="flex items-center gap-0.5 text-[9px] text-zinc-500">
												<MapPin className="size-2.5" />
												{job.loc} · {job.co}
											</p>
										</div>
									</motion.div>
								))}
								<div className="flex gap-2">
									<div className="flex-1 rounded-xl bg-amber-50 py-2 text-center">
										<p className="text-[9px] text-zinc-500">Posted</p>
										<p className="text-xs font-bold text-amber-700">+128</p>
									</div>
									<div className="flex-1 rounded-xl bg-amber-50 py-2 text-center">
										<p className="text-[9px] text-zinc-500">Views</p>
										<p className="text-xs font-bold text-amber-700">24.5k</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</motion.div>

			<FloatingStat
				delay={0.2}
				reduceMotion={!!reduceMotion}
				initial={{ opacity: 0, y: 24, x: 20 }}
				className="absolute right-0 top-[16%] z-20 sm:right-2"
			>
				<div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white px-4 py-3.5 text-foreground shadow-2xl shadow-black/20">
					<div
						aria-hidden
						className="flex size-12 items-center justify-center rounded-full border-[3px] border-muted border-t-brand-deep"
					>
						<Briefcase className="size-4 text-brand-deep" />
					</div>
					<div>
						<p className="text-[10px] font-medium text-muted-foreground">
							Goal: Dream role
						</p>
						<p className="text-sm font-bold">Apply this week</p>
						<p className="text-[10px] text-amber-600">3 steps left</p>
					</div>
				</div>
			</FloatingStat>

			<FloatingStat
				delay={0}
				reduceMotion={!!reduceMotion}
				initial={{ opacity: 0, x: -28 }}
				className="absolute left-0 top-[6%] z-20 sm:-left-6"
			>
				<div className="flex items-center gap-2.5 rounded-2xl border border-white/25 bg-white/95 px-3.5 py-2.5 text-foreground shadow-xl backdrop-blur">
					<span className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-pink-100 to-rose-100 text-rose-600">
						<TrendingUp className="size-4" />
					</span>
					<div>
						<p className="text-sm font-bold">250K+</p>
						<p className="text-[10px] text-muted-foreground">Monthly reach</p>
					</div>
				</div>
			</FloatingStat>

			<FloatingStat
				delay={0.35}
				reduceMotion={!!reduceMotion}
				initial={{ opacity: 0, y: 24 }}
				className="absolute bottom-[10%] left-2 z-20 sm:-left-2"
			>
				<div className="rounded-2xl border border-amber-400/30 bg-amber-950/80 px-4 py-2.5 text-white shadow-xl backdrop-blur">
					<p className="text-[10px] text-amber-200">Verified posts</p>
					<p className="text-sm font-bold">98% approval rate</p>
				</div>
			</FloatingStat>
		</div>
	);
}
