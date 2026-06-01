"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Briefcase,
	FolderKanban,
	Gauge,
	LayoutDashboard,
	Plus,
	Receipt,
	ScrollText,
	Settings,
	TrendingUp,
	Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ICON_MAP = {
	briefcase: Briefcase,
	"folder-kanban": FolderKanban,
	gauge: Gauge,
	"layout-dashboard": LayoutDashboard,
	plus: Plus,
	receipt: Receipt,
	"scroll-text": ScrollText,
	settings: Settings,
	"trending-up": TrendingUp,
	users: Users,
} as const;

export type SidebarIconName = keyof typeof ICON_MAP;

export interface SidebarNavItem {
	href: string;
	label: string;
	icon: SidebarIconName;
	exact?: boolean;
}

interface SidebarNavContentProps {
	brand: string;
	homeHref?: string;
	badge?: React.ReactNode;
	nav: SidebarNavItem[];
	footer?: React.ReactNode;
	onNavigate?: () => void;
}

export function SidebarNavContent({
	brand,
	homeHref = "/",
	badge,
	nav,
	footer,
	onNavigate,
}: SidebarNavContentProps) {
	const pathname = usePathname();

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="shrink-0 border-b px-4 py-4 sm:px-5 sm:py-5">
				<Link
					href={homeHref}
					onClick={onNavigate}
					className="flex min-w-0 items-center gap-2.5 font-bold"
				>
					<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm sm:size-8">
						<Briefcase className="size-4" />
					</span>
					<span className="truncate tracking-tight">{brand}</span>
				</Link>
				{badge && <div className="mt-3">{badge}</div>}
			</div>

			<nav className="flex-1 space-y-0.5 overflow-y-auto overscroll-contain p-3 text-sm">
				{nav.map((item) => {
					const active = item.exact
						? pathname === item.href
						: pathname === item.href ||
							(item.href !== "/" && pathname.startsWith(`${item.href}/`));
					const Icon = ICON_MAP[item.icon];
					return (
						<Link
							key={item.href}
							href={item.href}
							onClick={onNavigate}
							className={cn(
								"group relative flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium transition-colors sm:min-h-0 sm:py-2",
								active
									? "bg-primary/10 text-primary"
									: "text-muted-foreground hover:bg-accent hover:text-foreground",
							)}
						>
							{active && (
								<span
									aria-hidden="true"
									className="absolute inset-y-1.5 left-0 w-0.5 rounded-r bg-primary"
								/>
							)}
							<Icon
								className={cn(
									"size-4 shrink-0 transition-colors",
									active
										? "text-primary"
										: "text-muted-foreground group-hover:text-foreground",
								)}
							/>
							<span className="min-w-0 break-words">{item.label}</span>
						</Link>
					);
				})}
			</nav>

			{footer && <div className="shrink-0 border-t p-3">{footer}</div>}
		</div>
	);
}
