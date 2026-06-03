"use client";

import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import {
	MotionSection,
	Stagger,
	StaggerChild,
	HoverLift,
	EASE,
} from "@/components/home/motion";

const ITEMS: { icon: LucideIcon; title: string; body: string }[] = [
	{
		icon: Shield,
		title: "Moderated submissions",
		body: "Every post goes through admin review. Spam filters catch obvious abuse and AI signals flag risky content.",
	},
	{
		icon: CheckCircle2,
		title: "Payment-verified posts",
		body: "Posts go live only after a human approves the payment — no chargebacks, no fakes.",
	},
	{
		icon: Zap,
		title: "Instant publishing",
		body: "Once approved, your job hits the right Telegram category topic in under 60 seconds.",
	},
];

export function WhyUsSection() {
	return (
		<MotionSection className="container mx-auto px-4 py-24">
			<motion.div
				initial={{ opacity: 0, y: 24 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6, ease: EASE }}
				className="mb-12 text-center"
			>
				<p className="text-sm font-semibold uppercase tracking-wider text-primary">
					Why choose us
				</p>
				<h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
					Built for trust at scale
				</h2>
			</motion.div>

			<Stagger className="grid gap-6 md:grid-cols-3">
				{ITEMS.map(({ icon: Icon, title, body }) => (
					<StaggerChild key={title}>
						<HoverLift>
							<motion.div
								whileHover={{
									boxShadow: "0 20px 40px -15px var(--primary)",
								}}
								className="flex h-full gap-4 rounded-2xl border bg-card p-6 shadow-sm"
							>
								<motion.span
									whileHover={{ rotate: 360 }}
									transition={{ duration: 0.6 }}
									className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
								>
									<Icon className="size-5" />
								</motion.span>
								<div>
									<h3 className="font-semibold">{title}</h3>
									<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
										{body}
									</p>
								</div>
							</motion.div>
						</HoverLift>
					</StaggerChild>
				))}
			</Stagger>
		</MotionSection>
	);
}
