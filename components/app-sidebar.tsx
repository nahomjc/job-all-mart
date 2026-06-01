"use client";

import { SidebarNavContent } from "@/components/sidebar-nav-content";

export type { SidebarIconName, SidebarNavItem } from "@/components/sidebar-nav-content";

export interface AppSidebarProps {
	brand: string;
	homeHref?: string;
	badge?: React.ReactNode;
	nav: import("@/components/sidebar-nav-content").SidebarNavItem[];
	footer?: React.ReactNode;
}

export function AppSidebar({
	brand,
	homeHref = "/",
	badge,
	nav,
	footer,
}: AppSidebarProps) {
	return (
		<aside className="sticky top-0 hidden h-screen w-[244px] shrink-0 border-r bg-muted/30 md:flex md:flex-col">
			<SidebarNavContent
				brand={brand}
				homeHref={homeHref}
				badge={badge}
				nav={nav}
				footer={footer}
			/>
		</aside>
	);
}
