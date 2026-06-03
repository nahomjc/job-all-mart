"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ShellSearchProps {
	placeholder?: string;
	className?: string;
}

export function ShellSearch({
	placeholder = "Search tasks, jobs, payments…",
	className,
}: ShellSearchProps) {
	return (
		<div className={cn("relative hidden min-w-0 flex-1 md:block", className)}>
			<Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="search"
				placeholder={placeholder}
				className="h-11 rounded-xl border-border/60 bg-muted/50 pl-10 pr-16 shadow-none focus-visible:ring-primary/30"
			/>
			<kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline">
				⌘F
			</kbd>
		</div>
	);
}
