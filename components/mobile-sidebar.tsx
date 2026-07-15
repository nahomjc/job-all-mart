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
import type { SidebarNavSection } from "@/components/sidebar-nav-content";

interface MobileSidebarProps {
	brand: string;
	homeHref?: string;
	badge?: React.ReactNode;
	sections: SidebarNavSection[];
	footer?: React.ReactNode;
	promo?: boolean;
}

export function MobileSidebar({
	brand,
	homeHref,
	badge,
	sections,
	footer,
	promo,
}: MobileSidebarProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button
				type="button"
				variant="outline"
				size="icon"
				className="size-10 shrink-0 rounded-full border-black/10 bg-black/5 md:hidden dark:border-white/15 dark:bg-white/10"
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
					<div className="flex h-full min-h-0 flex-col bg-sidebar">
						<SidebarNavContent
							brand={brand}
							homeHref={homeHref}
							badge={badge}
							sections={sections}
							footer={footer}
							promo={promo}
							onNavigate={() => setOpen(false)}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
