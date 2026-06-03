import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SidebarPromo() {
	return (
		<div className="relative overflow-hidden rounded-2xl bg-brand-deep p-4 text-primary-foreground">
			<div
				aria-hidden
				className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-white/10"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute -bottom-8 -left-4 size-32 rounded-full bg-white/5"
			/>
			<div className="relative">
				<Sparkles className="size-5 text-primary-foreground/80" />
				<p className="mt-2 text-sm font-semibold leading-snug">
					Post jobs to Telegram in under a minute
				</p>
				<p className="mt-1 text-xs text-primary-foreground/75">
					Moderated, payment-verified reach to thousands of candidates.
				</p>
				<Button
					asChild
					size="sm"
					className="mt-3 h-9 w-full bg-white text-brand-deep hover:bg-white/90"
				>
					<Link href="/dashboard/jobs/new">Post a job</Link>
				</Button>
			</div>
		</div>
	);
}
