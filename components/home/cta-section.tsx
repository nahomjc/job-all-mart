"use client";

import Link from "next/link";
import { ArrowRight, Handshake, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { EASE, MotionSection } from "@/components/home/motion";
import { Button } from "@/components/ui/button";

export function CtaSection({ telegramJoinUrl }: { telegramJoinUrl: string }) {
	return (
		<MotionSection className="container mx-auto px-4 pb-24">
			<motion.div
				initial={{ opacity: 0, scale: 0.96, y: 40 }}
				whileInView={{ opacity: 1, scale: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.75, ease: EASE }}
				className="relative overflow-hidden rounded-[2rem] bg-brand-deep p-10 text-primary-foreground md:p-16"
			>
				<motion.div
					animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
					transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
					className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-emerald-400/30 blur-3xl"
				/>
				<motion.div
					animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
					transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY }}
					className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-white/10 blur-2xl"
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_55%)]"
				/>

				<div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
					>
						<span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
							<Handshake className="size-3.5" />
							Hire faster, hire smarter
						</span>
						<h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
							Ready to post your next role?
						</h2>
						<p className="mt-4 max-w-xl text-pretty text-lg text-primary-foreground/85">
							Reach thousands of vetted candidates on Telegram and the open web.
							Every post is human-reviewed and payment-verified before going live.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 30 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.25, duration: 0.6, ease: EASE }}
						className="flex flex-col gap-3 sm:flex-row md:flex-col"
					>
						<motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
							<Button
								asChild
								size="lg"
								className="h-12 w-full rounded-full bg-white text-brand-deep hover:bg-white/90 sm:w-auto md:w-full"
							>
								<Link href="/login?mode=signup">
									Post a job <ArrowRight className="size-4" />
								</Link>
							</Button>
						</motion.div>
						<motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
							<Button
								asChild
								size="lg"
								variant="outline"
								className="h-12 w-full rounded-full border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 sm:w-auto md:w-full"
							>
								<a
									href={telegramJoinUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									<MessageSquare className="size-4" /> Telegram bot
								</a>
							</Button>
						</motion.div>
					</motion.div>
				</div>
			</motion.div>
		</MotionSection>
	);
}
