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
import { BrandLogo } from "@/components/brand-logo";
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
				"group flex min-h-10 items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-medium transition-all",
				active
					? "bg-muted text-foreground shadow-none"
					: "text-sidebar-foreground/80 hover:bg-muted/60 hover:text-foreground",
			)}
		>
			<Icon
				className={cn(
					"size-[18px] shrink-0",
					active ? "text-foreground" : "opacity-65 group-hover:opacity-100",
				)}
			/>
			<span className="min-w-0 flex-1 truncate">{item.label}</span>
			{item.badge && (
				<span
					className={cn(
						"rounded-full px-2 py-0.5 text-[10px] font-bold",
						active
							? "bg-background text-foreground"
							: "bg-primary/10 text-primary",
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

	const itemMatches = (item: SidebarNavItem) =>
		item.exact
			? pathname === item.href
			: pathname === item.href ||
				(item.href !== "/" && pathname.startsWith(`${item.href}/`));

	// When multiple items match (e.g. "/dashboard/jobs" and
	// "/dashboard/jobs/new"), only the most specific (longest href) wins.
	const activeHref = sections
		.flatMap((section) => section.items)
		.filter(itemMatches)
		.reduce<string | null>(
			(best, item) =>
				best === null || item.href.length > best.length ? item.href : best,
			null,
		);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="shrink-0 px-5 pb-4 pt-6">
				<Link
					href={homeHref}
					onClick={onNavigate}
					data-tour="brand"
					className="flex min-w-0 items-center gap-3"
				>
					<BrandLogo size={40} className="shadow-md shadow-primary/20" priority />
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
								const active = item.href === activeHref;
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
