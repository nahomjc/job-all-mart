"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { ShellSearch } from "@/components/shell-search";
import type { SidebarNavSection } from "@/components/sidebar-nav-content";

interface AppShellHeaderProps {
	brand: string;
	homeHref?: string;
	badge?: React.ReactNode;
	sections: SidebarNavSection[];
	footer?: React.ReactNode;
	promo?: boolean;
	searchPlaceholder?: string;
	searchAction?: string;
	actions?: React.ReactNode;
	userStrip?: React.ReactNode;
}

export function AppShellHeader({
	brand,
	homeHref = "/",
	badge,
	sections,
	footer,
	promo,
	searchPlaceholder,
	searchAction,
	actions,
	userStrip,
}: AppShellHeaderProps) {
	return (
		<header className="sticky top-0 z-30 shrink-0 px-3 pt-3 sm:px-4 sm:pt-4">
			<div className="pointer-events-auto">
				<div className="grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-full border border-border/70 bg-background/85 px-2.5 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:h-[3.75rem] sm:gap-3 sm:px-3 dark:border-white/10 dark:bg-black/50 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
					{/* Left: mobile nav + brand */}
					<div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
						<MobileSidebar
							brand={brand}
							homeHref={homeHref}
							badge={badge}
							sections={sections}
							footer={footer}
							promo={promo}
						/>
						<Link
							href={homeHref}
							className="flex min-w-0 items-center gap-2 font-bold text-black dark:text-white"
						>
							<BrandLogo size={30} priority />
							<span className="hidden truncate text-sm font-semibold tracking-tight sm:inline sm:text-[15px]">
								{brand}
							</span>
						</Link>
						{badge ? (
							<span className="hidden lg:inline-flex">{badge}</span>
						) : null}
					</div>

					{/* Center: search */}
					<div className="min-w-0 px-1">
						<ShellSearch
							placeholder={searchPlaceholder}
							action={searchAction}
							className="mx-auto max-w-xl"
						/>
					</div>

					{/* Right: actions / profile */}
					<div
						data-tour="header-actions"
						className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2"
					>
						{actions}
						{userStrip}
					</div>
				</div>
			</div>
		</header>
	);
}
