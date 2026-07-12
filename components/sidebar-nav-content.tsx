"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Briefcase,
	CircleHelp,
	FolderKanban,
	Gauge,
	LayoutDashboard,
	LogOut,
	Plus,
	Receipt,
	ScrollText,
	Settings,
	TrendingUp,
	Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarPromo } from "@/components/sidebar-promo";

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
	"circle-help": CircleHelp,
	"log-out": LogOut,
} as const;

export type SidebarIconName = keyof typeof ICON_MAP;

export interface SidebarNavItem {
	href: string;
	label: string;
	icon: SidebarIconName;
	exact?: boolean;
	badge?: string;
	dataTour?: string;
}

export interface SidebarNavSection {
	title: string;
	items: SidebarNavItem[];
}

interface SidebarNavContentProps {
	brand: string;
	homeHref?: string;
	badge?: React.ReactNode;
	sections: SidebarNavSection[];
	footer?: React.ReactNode;
	promo?: boolean;
	onNavigate?: () => void;
}

function NavLink({
	item,
	active,
	onNavigate,
}: {
	item: SidebarNavItem;
	active: boolean;
	onNavigate?: () => void;
}) {
	const Icon = ICON_MAP[item.icon];
	return (
		<Link
			href={item.href}
			onClick={onNavigate}
			data-tour={item.dataTour}
			className={cn(
				"group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
				active
					? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
					: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
			)}
		>
			<Icon
				className={cn(
					"size-[18px] shrink-0",
					active ? "text-primary-foreground" : "opacity-70 group-hover:opacity-100",
				)}
			/>
			<span className="min-w-0 flex-1 truncate">{item.label}</span>
			{item.badge && (
				<span
					className={cn(
						"rounded-full px-2 py-0.5 text-[10px] font-bold",
						active
							? "bg-primary-foreground/20 text-primary-foreground"
							: "bg-primary text-primary-foreground",
					)}
				>
					{item.badge}
				</span>
			)}
		</Link>
	);
}

export function SidebarNavContent({
	brand,
	homeHref = "/",
	badge,
	sections,
	footer,
	promo = true,
	onNavigate,
}: SidebarNavContentProps) {
	const pathname = usePathname();

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="shrink-0 px-5 pb-4 pt-6">
				<Link
					href={homeHref}
					onClick={onNavigate}
					data-tour="brand"
					className="flex min-w-0 items-center gap-3"
				>
					<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
						<Briefcase className="size-5" />
					</span>
					<span className="truncate text-lg font-bold tracking-tight">{brand}</span>
				</Link>
				{badge && <div className="mt-3">{badge}</div>}
			</div>

			<nav className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 pb-4">
				{sections.map((section) => (
					<div key={section.title}>
						<p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
							{section.title}
						</p>
						<div className="space-y-1">
							{section.items.map((item) => {
								const active = item.exact
									? pathname === item.href
									: pathname === item.href ||
										(item.href !== "/" && pathname.startsWith(`${item.href}/`));
								return (
									<NavLink
										key={item.href}
										item={item}
										active={active}
										onNavigate={onNavigate}
									/>
								);
							})}
						</div>
					</div>
				))}
			</nav>

			{promo && (
				<div className="shrink-0 px-4 pb-3">
					<SidebarPromo />
				</div>
			)}

			{footer && (
				<div className="shrink-0 border-t border-sidebar-border px-4 py-3">
					{footer}
				</div>
			)}
		</div>
	);
}
