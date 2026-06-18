"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
	ArrowRight,
	Bookmark,
	Briefcase,
	Globe,
	MapPin,
	Sparkles,
	TrendingUp,
	Users,
	Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import {
	EASE,
	MotionBlock,
	MotionSection,
	Stagger,
	StaggerChild,
	HoverLift,
} from "@/components/home/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const THEMES = [
	{ accent: "bg-amber-400", iconBg: "bg-amber-100 text-amber-700", icon: Briefcase },
	{ accent: "bg-pink-400", iconBg: "bg-pink-100 text-pink-700", icon: Wallet },
	{ accent: "bg-sky-400", iconBg: "bg-sky-100 text-sky-700", icon: TrendingUp },
	{ accent: "bg-orange-400", iconBg: "bg-orange-100 text-orange-700", icon: Users },
	{ accent: "bg-violet-400", iconBg: "bg-violet-100 text-violet-700", icon: Globe },
	{ accent: "bg-sky-400", iconBg: "bg-sky-100 text-sky-700", icon: Sparkles },
] as const;

type CategoryItem = { id: string; name: string; slug: string };

export function CategoriesSection({ categories }: { categories: CategoryItem[] }) {
	if (categories.length === 0) return null;

	return (
		<MotionSection className="bg-muted/40 py-24">
			<div className="container mx-auto px-4">
				<div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
					<MotionBlock variant="fadeUp">
						<p className="text-sm font-semibold uppercase tracking-wider text-primary">
							Popular categories
						</p>
						<h2 className="mt-2 text-balance text-3xl font-bold tracking-tight md:text-4xl">
							Discover jobs across top industries
						</h2>
					</MotionBlock>
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, ease: EASE }}
					>
						<Button asChild variant="outline" className="rounded-full">
							<Link href="/jobs">
								Browse all <ArrowRight className="size-4" />
							</Link>
						</Button>
					</motion.div>
				</div>

				<Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{categories.map((c, i) => {
						const theme = THEMES[i % THEMES.length];
						const Icon = theme.icon as LucideIcon;
						return (
							<StaggerChild key={c.id}>
								<HoverLift>
									<Card className="group relative overflow-hidden border-transparent bg-background shadow-sm">
										<motion.div
											className={`h-1.5 w-full ${theme.accent}`}
											initial={{ scaleX: 0 }}
											whileInView={{ scaleX: 1 }}
											viewport={{ once: true }}
											transition={{ delay: i * 0.05, duration: 0.4 }}
										/>
										<CardContent className="p-5">
											<div className="flex items-start justify-between">
												<motion.span
													whileHover={{ rotate: [0, -8, 8, 0] }}
													transition={{ duration: 0.4 }}
													className={`flex size-10 items-center justify-center rounded-xl ${theme.iconBg}`}
												>
													<Icon className="size-5" />
												</motion.span>
												<Bookmark className="size-4 text-muted-foreground/50" />
											</div>
											<h3 className="mt-3 line-clamp-1 text-base font-semibold">
												{c.name}
											</h3>
											<div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
												<div className="flex items-center gap-1.5">
													<MapPin className="size-3.5" />
													Remote · Global
												</div>
												<div className="flex items-center gap-1.5">
													<Briefcase className="size-3.5" />
													Full time
												</div>
											</div>
											<Button asChild className="mt-4 w-full rounded-xl" size="sm">
												<Link href={`/jobs?category=${c.slug}`}>Apply Now</Link>
											</Button>
										</CardContent>
									</Card>
								</HoverLift>
							</StaggerChild>
						);
					})}
				</Stagger>
			</div>
		</MotionSection>
	);
}
