"use client";

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
	homeHref,
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
		<header className="sticky top-0 z-30 shrink-0 border-b border-border/40 bg-card/80 px-4 py-3.5 backdrop-blur-md supports-[backdrop-filter]:bg-card/70 sm:px-6 lg:px-8">
			<div className="flex items-center gap-3 lg:gap-5">
				<MobileSidebar
					brand={brand}
					homeHref={homeHref}
					badge={badge}
					sections={sections}
					footer={footer}
					promo={promo}
				/>

				<ShellSearch
					placeholder={searchPlaceholder}
					action={searchAction}
					className="max-w-2xl"
				/>

				<div
					data-tour="header-actions"
					className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2"
				>
					{actions}

					{userStrip && (
						<>
							<span className="mx-1 hidden h-8 w-px bg-border/80 sm:block" />
							{userStrip}
						</>
					)}
				</div>
			</div>
		</header>
	);
}
