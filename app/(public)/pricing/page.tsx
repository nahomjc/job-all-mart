import Link from "next/link";
import { Check } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import { pricingPlanRepo } from "@/server/repositories/pricing-plan";
import type { PricingPlan } from "@/server/db/schema";

export const metadata = {
	title: "Pricing",
	description: "Pay per job post. No subscription.",
};

function splitPrice(label: string): { prefix: string | null; amount: string } {
	const trimmed = label.trim();
	const match = trimmed.match(/^(.+?)\s+([\d,]+(?:\.\d+)?)$/);
	if (match?.[1] && match[2]) {
		return { prefix: match[1].trim(), amount: match[2] };
	}
	return { prefix: null, amount: trimmed };
}

function CardArtwork({
	variant,
	highlighted,
}: {
	variant: number;
	highlighted: boolean;
}) {
	const tone = highlighted
		? "text-primary opacity-90"
		: "text-primary/45 dark:text-primary/55";
	const gid = `pricing-art-${variant}`;

	if (variant % 3 === 0) {
		return (
			<svg
				viewBox="0 0 120 120"
				className={cn("size-full", tone)}
				aria-hidden="true"
				focusable="false"
			>
				<title>Decorative spiral</title>
				<defs>
					<linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
						<stop offset="100%" stopColor="currentColor" stopOpacity="0.25" />
					</linearGradient>
				</defs>
				<path
					d="M60 18c23 0 42 19 42 42s-19 42-42 42-42-19-42-42"
					fill="none"
					stroke={`url(#${gid})`}
					strokeWidth="10"
					strokeLinecap="round"
				/>
				<path
					d="M60 34c14 0 26 12 26 26s-12 26-26 26-26-12-26-26"
					fill="none"
					stroke="currentColor"
					strokeWidth="8"
					strokeLinecap="round"
					opacity="0.55"
				/>
				<circle cx="60" cy="60" r="10" fill="currentColor" opacity="0.35" />
			</svg>
		);
	}

	if (variant % 3 === 1) {
		return (
			<svg
				viewBox="0 0 120 120"
				className={cn("size-full", tone)}
				aria-hidden="true"
				focusable="false"
			>
				<title>Decorative cube</title>
				<g fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.85">
					<path d="M60 22 98 44v44L60 110 22 88V44Z" />
					<path d="M60 22v88M22 44l76 44M98 44 22 88" opacity="0.5" />
					<path d="M40 56h40v28H40Z" opacity="0.7" />
				</g>
				<circle cx="60" cy="66" r="6" fill="currentColor" opacity="0.4" />
			</svg>
		);
	}

	return (
		<svg
			viewBox="0 0 120 120"
			className={cn("size-full", tone)}
			aria-hidden="true"
			focusable="false"
		>
			<title>Decorative rings</title>
			<g fill="none" stroke="currentColor" strokeWidth="3" opacity="0.9">
				<ellipse cx="60" cy="60" rx="38" ry="18" transform="rotate(20 60 60)" />
				<ellipse cx="60" cy="60" rx="38" ry="18" transform="rotate(-40 60 60)" />
				<ellipse cx="60" cy="60" rx="38" ry="18" transform="rotate(80 60 60)" />
			</g>
			<circle cx="60" cy="60" r="8" fill="currentColor" opacity="0.45" />
		</svg>
	);
}

function PricingCard({
	plan,
	brandName,
	index,
}: {
	plan: PricingPlan;
	brandName: string;
	index: number;
}) {
	const { prefix, amount } = splitPrice(plan.priceLabel);
	const features = plan.features ?? [];

	return (
		<article
			className={cn(
				"group relative flex flex-col overflow-hidden rounded-[1.75rem] border p-6 shadow-sm transition duration-300 sm:p-7",
				"bg-card/80 backdrop-blur-xl",
				plan.highlight
					? "border-primary/40 shadow-[0_20px_60px_-20px_color-mix(in_oklab,var(--primary)_45%,transparent)] ring-1 ring-primary/25"
					: "border-border/80 hover:border-primary/25 hover:shadow-md",
			)}
		>
			{plan.highlight ? (
				<>
					<div
						aria-hidden
						className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-primary/25 blur-3xl"
					/>
					<div
						aria-hidden
						className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"
					/>
				</>
			) : (
				<div
					aria-hidden
					className="pointer-events-none absolute -right-8 -top-8 size-36 rounded-full bg-primary/10 blur-3xl opacity-0 transition group-hover:opacity-100"
				/>
			)}

			<div className="relative flex items-start justify-between gap-3">
				<div className="flex min-w-0 items-center gap-2.5">
					<BrandLogo size={28} />
					<span className="truncate text-sm font-semibold tracking-tight">
						{brandName}
					</span>
				</div>
				<div className="relative size-20 shrink-0 sm:size-24">
					{plan.highlight ? (
						<span
							aria-hidden
							className="absolute inset-2 rounded-full bg-primary/20 blur-xl"
						/>
					) : null}
					<CardArtwork variant={index} highlighted={plan.highlight} />
				</div>
			</div>

			<div className="relative mt-2">
				<p className="text-sm font-medium text-muted-foreground">{plan.name}</p>
				<div className="mt-1 flex items-end gap-2">
					{prefix ? (
						<span className="mb-2 text-sm font-medium text-muted-foreground">
							{prefix}
						</span>
					) : null}
					<span className="text-5xl font-light tracking-tight sm:text-6xl">
						{amount}
					</span>
					{plan.cadence ? (
						<span className="mb-2 text-sm text-muted-foreground">
							{plan.cadence}
						</span>
					) : null}
				</div>
				{plan.description ? (
					<p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
				) : null}
			</div>

			<ul className="relative mt-6 flex flex-1 flex-col gap-3">
				{features.map((feature) => (
					<li key={feature} className="flex items-start gap-2.5 text-sm">
						<span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
							<Check className="size-3" strokeWidth={3} />
						</span>
						<span className="text-foreground/90">{feature}</span>
					</li>
				))}
			</ul>

			<div className="relative mt-8">
				{plan.highlight ? (
					<p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
						Most popular
					</p>
				) : (
					<p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
						Pay per post
					</p>
				)}
				<Button
					asChild
					size="lg"
					className={cn(
						"h-12 w-full rounded-full text-sm font-semibold",
						plan.highlight
							? "bg-linear-to-b from-primary to-[color-mix(in_oklab,var(--primary)_82%,var(--brand-deep))] shadow-[0_10px_30px_-12px_color-mix(in_oklab,var(--primary)_70%,transparent)]"
							: "bg-linear-to-b from-foreground to-[color-mix(in_oklab,var(--foreground)_88%,black)] text-background hover:opacity-95",
					)}
				>
					<Link href={plan.ctaHref || "/post/new"}>
						{plan.ctaLabel || "Post a job"}
					</Link>
				</Button>
				<p className="mt-3 text-center text-[11px] text-muted-foreground">
					Reviewed before it goes live
				</p>
			</div>
		</article>
	);
}

export default async function PricingPage() {
	const tiers = await pricingPlanRepo.listActive();
	const brandName = env.NEXT_PUBLIC_APP_NAME;

	return (
		<div className="relative overflow-hidden">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-5%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_60%)]"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute -left-24 top-48 size-72 rounded-full bg-primary/10 blur-3xl"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute -right-20 bottom-24 size-64 rounded-full bg-[color-mix(in_oklab,var(--brand-deep)_10%,transparent)] blur-3xl"
			/>

			<div className="container relative mx-auto px-4 pb-20 pt-28">
				<div className="mx-auto max-w-2xl text-center">
					<p className="text-sm font-semibold uppercase tracking-wider text-primary">
						Plans
					</p>
					<h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
						Pricing
					</h1>
					<p className="mt-3 text-pretty text-muted-foreground sm:text-lg">
						Pay per post. No subscription. Upgrade for faster review, featured
						placement, and exclusive reach.
					</p>
				</div>

				{tiers.length === 0 ? (
					<div className="mx-auto mt-14 max-w-md rounded-2xl border border-dashed bg-card/60 px-6 py-12 text-center text-sm text-muted-foreground backdrop-blur-sm">
						Pricing plans are not published yet. Check back soon.
					</div>
				) : (
					<div
						className={cn(
							"mx-auto mt-14 grid max-w-6xl gap-5 sm:gap-6",
							tiers.length === 1 && "max-w-md",
							tiers.length === 2 && "max-w-3xl md:grid-cols-2",
							tiers.length === 3 && "md:grid-cols-2 lg:grid-cols-3",
							tiers.length >= 4 && "md:grid-cols-2 xl:grid-cols-4",
						)}
					>
						{tiers.map((plan, index) => (
							<PricingCard
								key={plan.id}
								plan={plan}
								brandName={brandName}
								index={index}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
