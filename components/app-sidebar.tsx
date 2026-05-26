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

/**
 * Map of serializable icon names to the actual Lucide components. Pass a name
 * (a plain string) from a server component instead of a component reference,
 * so the nav config can cross the RSC boundary without serialization errors.
 */
const ICON_MAP = {
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
  /** Key into the icon registry — kept as a plain string for RSC serialization. */
  icon: SidebarIconName;
  /** When set, the item is only "active" on an exact path match. */
  exact?: boolean;
}

export interface AppSidebarProps {
  brand: string;
  homeHref?: string;
  badge?: React.ReactNode;
  nav: SidebarNavItem[];
  footer?: React.ReactNode;
}

export function AppSidebar({
  brand,
  homeHref = "/",
  badge,
  nav,
  footer,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen border-r bg-muted/30 md:flex md:w-[244px] md:shrink-0 md:flex-col">
      {/* Brand */}
      <div className="border-b px-5 py-5">
        <Link href={homeHref} className="flex items-center gap-2.5 font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Briefcase className="size-4" />
          </span>
          <span className="tracking-tight">{brand}</span>
        </Link>
        {badge && <div className="mt-3">{badge}</div>}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 text-sm">
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
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium transition-colors",
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
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {footer && <div className="border-t p-3">{footer}</div>}
    </aside>
  );
}
