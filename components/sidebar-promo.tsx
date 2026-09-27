"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SidebarPromo() {
	const t = useTranslations("nav");
	const th = useTranslations("home");

	return (
		<div className="relative overflow-hidden rounded-2xl bg-brand-deep p-4 text-white">
			<div
				aria-hidden
				className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/30 blur-2xl"
			/>
			<div className="relative">
				<span className="inline-flex size-8 items-center justify-center rounded-xl bg-white/10">
					<Sparkles className="size-4" />
				</span>
				<p className="mt-3 text-sm font-semibold leading-snug">
					{th("headline")}
				</p>
				<p className="mt-1 text-xs text-white/70">
					{th("subheadline")}
				</p>
				<Button
					asChild
					size="sm"
					className="mt-4 h-9 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
				>
					<Link href="/dashboard/jobs/new">{t("postJob")}</Link>
				</Button>
			</div>
		</div>
	);
}
