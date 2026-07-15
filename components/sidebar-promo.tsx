import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SidebarPromo() {
	return (
		<div className="relative overflow-hidden rounded-2xl bg-[#0f172a] p-4 text-white dark:bg-brand-deep">
			<div
				aria-hidden
				className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/30 blur-2xl"
			/>
			<div className="relative">
				<span className="inline-flex size-8 items-center justify-center rounded-xl bg-white/10">
					<Sparkles className="size-4" />
				</span>
				<p className="mt-3 text-sm font-semibold leading-snug">
					Reach more candidates
				</p>
				<p className="mt-1 text-xs text-white/70">
					Publish moderated job posts to Telegram in under a minute.
				</p>
				<Button
					asChild
					size="sm"
					className="mt-4 h-9 w-full rounded-full bg-white text-slate-900 hover:bg-white/90"
				>
					<Link href="/dashboard/jobs/new">Post a job</Link>
				</Button>
			</div>
		</div>
	);
}
