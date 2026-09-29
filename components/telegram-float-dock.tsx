"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, MessageCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { EASE } from "@/components/home/motion";
import { cn } from "@/lib/utils";

function TelegramGlyph({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden
			className={className}
			fill="currentColor"
		>
			<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
		</svg>
	);
}

type TelegramFloatDockProps = {
	channelUrl: string;
	botUsername: string;
};

export function TelegramFloatDock({
	channelUrl,
	botUsername,
}: TelegramFloatDockProps) {
	const t = useTranslations("telegramDock");
	const reduce = useReducedMotion();
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	const botHandle = botUsername.replace(/^@/, "");
	const botUrl = `https://t.me/${botHandle}?start=start`;

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<div className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
			<AnimatePresence>
				{open ? (
					<motion.div
						key="panel"
						role="dialog"
						aria-label={t("title")}
						initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.96 }}
						transition={{ duration: 0.28, ease: EASE }}
						className="pointer-events-auto w-[min(100vw-2rem,20.5rem)] overflow-hidden rounded-2xl border border-border/70 bg-card"
					>
						<div className="flex items-start justify-between gap-3 border-b border-border/60 bg-[#229ED9] px-4 py-3.5 text-white">
							<div className="min-w-0">
								<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
									{t("eyebrow")}
								</p>
								<p className="mt-0.5 truncate text-sm font-semibold">
									{t("title")}
								</p>
							</div>
							<button
								type="button"
								onClick={() => setOpen(false)}
								aria-label={t("close")}
								className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
							>
								<X className="size-4" />
							</button>
						</div>

						<div className="space-y-2 p-3">
							<a
								href={channelUrl}
								target="_blank"
								rel="noopener noreferrer"
								className={cn(
									"group flex items-start gap-3 rounded-xl border border-border/70 bg-background px-3 py-3 transition",
									"hover:border-[#229ED9]/40 hover:bg-[#229ED9]/5",
								)}
							>
								<span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#229ED9]/15 text-[#229ED9]">
									<MessageCircle className="size-5" />
								</span>
								<span className="min-w-0 flex-1">
									<span className="block text-sm font-semibold text-foreground">
										{t("channelTitle")}
									</span>
									<span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
										{t("channelBody")}
									</span>
									<span className="mt-1.5 inline-flex text-xs font-semibold text-[#229ED9] group-hover:underline">
										{t("channelCta")} →
									</span>
								</span>
							</a>

							<a
								href={botUrl}
								target="_blank"
								rel="noopener noreferrer"
								className={cn(
									"group flex items-start gap-3 rounded-xl border border-border/70 bg-background px-3 py-3 transition",
									"hover:border-primary/40 hover:bg-primary/5",
								)}
							>
								<span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-foreground dark:text-primary">
									<Bot className="size-5" />
								</span>
								<span className="min-w-0 flex-1">
									<span className="block text-sm font-semibold text-foreground">
										{t("botTitle")}
									</span>
									<span className="mt-0.5 block font-mono text-xs text-muted-foreground">
										@{botHandle}
									</span>
									<span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
										{t("botBody")}
									</span>
									<span className="mt-1.5 inline-flex text-xs font-semibold text-primary group-hover:underline">
										{t("botCta")} →
									</span>
								</span>
							</a>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>

			<div className="pointer-events-auto relative">
				{!reduce && !open ? (
					<span
						aria-hidden
						className="absolute inset-0 animate-ping rounded-full bg-[#229ED9]/35"
					/>
				) : null}
				<button
					type="button"
					aria-expanded={open}
					aria-label={open ? t("close") : t("open")}
					onClick={() => setOpen((v) => !v)}
					className={cn(
						"relative flex size-14 items-center justify-center rounded-full transition",
						open
							? "bg-brand-deep text-white hover:bg-brand-deep/90"
							: "bg-[#229ED9] text-white hover:bg-[#1a8bc4]",
					)}
				>
					{open ? (
						<X className="size-5" />
					) : (
						<TelegramGlyph className="size-7" />
					)}
				</button>
			</div>
		</div>
	);
}
