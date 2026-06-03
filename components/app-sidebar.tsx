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
		<aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
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
