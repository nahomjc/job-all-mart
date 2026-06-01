"use client";

import { MobileSidebar } from "@/components/mobile-sidebar";
import type { SidebarNavItem } from "@/components/sidebar-nav-content";

interface AppShellHeaderProps {
	brand: string;
	homeHref?: string;
	badge?: React.ReactNode;
	nav: SidebarNavItem[];
	footer?: React.ReactNode;
	leading?: React.ReactNode;
	actions?: React.ReactNode;
}

export function AppShellHeader({
	brand,
	homeHref,
	badge,
	nav,
	footer,
	leading,
	actions,
}: AppShellHeaderProps) {
	return (
		<header className="sticky top-0 z-30 flex min-h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:min-h-16 sm:gap-3 sm:px-4 md:px-6 lg:px-8">
			<div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
				<MobileSidebar
					brand={brand}
					homeHref={homeHref}
					badge={badge}
					nav={nav}
					footer={footer}
				/>
				<div className="min-w-0 flex-1">{leading}</div>
			</div>
			{actions && (
				<div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
					{actions}
				</div>
			)}
		</header>
	);
}
