"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown, LayoutGrid } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type CategoryItem = { id: string; name: string; slug: string };

export function CategoriesNav({ categories }: { categories: CategoryItem[] }) {
	if (categories.length === 0) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					"group inline-flex items-center gap-1.5 outline-none transition-colors",
					"hover:text-black focus-visible:text-black",
					"data-[state=open]:text-black",
					"dark:hover:text-white dark:focus-visible:text-white dark:data-[state=open]:text-white",
				)}
			>
				Categories
				<ChevronDown className="size-3.5 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="start"
				sideOffset={12}
				className="w-[min(100vw-2rem,22rem)] rounded-2xl border-border/70 bg-card p-0 shadow-lg shadow-black/5"
			>
				<div className="border-b border-border/60 px-4 py-3">
					<div className="flex items-center gap-2.5">
						<span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<LayoutGrid className="size-4" aria-hidden />
						</span>
						<div>
							<p className="text-sm font-semibold tracking-tight">
								Browse by category
							</p>
							<p className="text-xs text-muted-foreground">
								Find roles in your field
							</p>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-0.5 p-2 sm:grid-cols-2">
					{categories.map((c) => (
						<DropdownMenuItem
							key={c.id}
							asChild
							className="cursor-pointer rounded-xl px-0 py-0 focus:bg-transparent"
						>
							<Link
								href={`/jobs?category=${c.slug}`}
								className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm transition-colors hover:bg-muted/80 focus:bg-muted/80"
							>
								<span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-xs font-semibold text-foreground/80">
									{c.name.trim().charAt(0).toUpperCase()}
								</span>
								<span className="min-w-0 flex-1 truncate font-medium">
									{c.name}
								</span>
							</Link>
						</DropdownMenuItem>
					))}
				</div>

				<div className="border-t border-border/60 p-2">
					<DropdownMenuItem
						asChild
						className="cursor-pointer rounded-xl px-0 py-0 focus:bg-transparent"
					>
						<Link
							href="/jobs"
							className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5 focus:bg-primary/5"
						>
							View all jobs
							<ArrowRight className="size-4" aria-hidden />
						</Link>
					</DropdownMenuItem>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
