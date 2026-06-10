"use client";

import { SidebarNavContent } from "@/components/sidebar-nav-content";
import type { SidebarNavSection } from "@/components/sidebar-nav-content";

export type { SidebarIconName, SidebarNavItem, SidebarNavSection } from "@/components/sidebar-nav-content";

export interface AppSidebarProps {
	brand: string;
	homeHref?: string;
	badge?: React.ReactNode;
	sections: SidebarNavSection[];
	footer?: React.ReactNode;
	promo?: boolean;
}

export function AppSidebar({
	brand,
	homeHref = "/",
	badge,
	sections,
	footer,
	promo = true,
}: AppSidebarProps) {
	return (
		<aside className="fixed inset-y-0 left-0 z-40 hidden h-svh w-[260px] flex-col border-r border-sidebar-border bg-sidebar md:flex">
			<SidebarNavContent
				brand={brand}
				homeHref={homeHref}
				badge={badge}
				sections={sections}
				footer={footer}
				promo={promo}
			/>
		</aside>
	);
}
