"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, Menu } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
} from "@/components/ui/dialog";

type CategoryItem = { id: string; name: string; slug: string };

interface MobileNavProps {
	brandName: string;
	categories: CategoryItem[];
	signedIn: boolean;
}

export function MobileNav({ brandName, categories, signedIn }: MobileNavProps) {
	const [open, setOpen] = useState(false);
	const close = () => setOpen(false);

	return (
		<>
			<Button
				type="button"
				variant="outline"
				size="icon"
				className="size-10 shrink-0 rounded-xl md:hidden"
				onClick={() => setOpen(true)}
				aria-label="Open menu"
			>
				<Menu className="size-5" />
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent
					className="fixed inset-y-0 left-0 top-0 z-50 flex h-full w-[min(100vw-3rem,20rem)] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-r p-0 shadow-xl duration-300 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-xs"
					aria-describedby={undefined}
				>
					<DialogTitle className="sr-only">Navigation</DialogTitle>
					<div className="flex h-full min-h-0 flex-col bg-background">
						<div className="shrink-0 border-b px-5 pb-4 pt-6">
							<Link
								href="/"
								onClick={close}
								className="flex min-w-0 items-center gap-3"
							>
								<BrandLogo size={40} />
								<span className="truncate text-lg font-bold tracking-tight">
									{brandName}
								</span>
							</Link>
						</div>

						<nav className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-5">
							<div className="space-y-1">
								<p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
									Menu
								</p>
								<MobileLink href="/jobs" onNavigate={close}>
									Jobs
								</MobileLink>
								<MobileLink href="/pricing" onNavigate={close}>
									Pricing
								</MobileLink>
							</div>

							{categories.length > 0 && (
								<div>
									<p className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
										<LayoutGrid className="size-3.5" aria-hidden />
										Categories
									</p>
									<div className="space-y-1">
										{categories.map((c) => (
											<MobileLink
												key={c.id}
												href={`/jobs?category=${c.slug}`}
												onNavigate={close}
											>
												{c.name}
											</MobileLink>
										))}
									</div>
								</div>
							)}
						</nav>

						{!signedIn && (
							<div className="shrink-0 space-y-2 border-t p-4">
								<Button asChild className="h-11 w-full rounded-xl">
									<Link href="/login?mode=signup" onClick={close}>
										Post a job
									</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									className="h-11 w-full rounded-xl"
								>
									<Link href="/login" onClick={close}>
										Sign in
									</Link>
								</Button>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

function MobileLink({
	href,
	onNavigate,
	children,
}: {
	href: string;
	onNavigate: () => void;
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			onClick={onNavigate}
			className="flex min-h-10 items-center rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
		>
			{children}
		</Link>
	);
}
