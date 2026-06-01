"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
} from "@/components/ui/dialog";
import { SidebarNavContent } from "@/components/sidebar-nav-content";
import type { SidebarNavItem } from "@/components/sidebar-nav-content";

interface MobileSidebarProps {
	brand: string;
	homeHref?: string;
	badge?: React.ReactNode;
	nav: SidebarNavItem[];
	footer?: React.ReactNode;
}

export function MobileSidebar({
	brand,
	homeHref,
	badge,
	nav,
	footer,
}: MobileSidebarProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button
				type="button"
				variant="outline"
				size="icon"
				className="size-11 shrink-0 md:hidden"
				onClick={() => setOpen(true)}
				aria-label="Open navigation menu"
			>
				<Menu className="size-5" />
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent
					className="fixed inset-y-0 left-0 top-0 z-50 flex h-full w-[min(100vw-3rem,20rem)] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-r p-0 shadow-xl duration-300 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-xs"
					aria-describedby={undefined}
				>
					<DialogTitle className="sr-only">Navigation</DialogTitle>
					<div className="flex h-full min-h-0 flex-col bg-muted/30">
						<SidebarNavContent
							brand={brand}
							homeHref={homeHref}
							badge={badge}
							nav={nav}
							footer={footer}
							onNavigate={() => setOpen(false)}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
