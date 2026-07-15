"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Check,
	ChevronDown,
	LayoutDashboard,
	LogOut,
	Shield,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

export interface UserMenuProps {
	name: string;
	email?: string | null;
	role: string;
	/** Show name + email beside avatar (desktop shell). */
	showProfile?: boolean;
	/** Pill capsule trigger like marketing headers. */
	variant?: "default" | "capsule";
	align?: "start" | "end" | "center";
}

function roleLabel(role: string): string {
	if (role === "admin" || role === "owner") return "Admin";
	if (role === "user") return "Employer";
	return role.charAt(0).toUpperCase() + role.slice(1);
}

export function UserMenu({
	name,
	email,
	role,
	showProfile = true,
	variant = "default",
	align = "end",
}: UserMenuProps) {
	const pathname = usePathname();
	const initials =
		name
			.split(/\s+/)
			.map((s) => s[0])
			.join("")
			.slice(0, 2)
			.toUpperCase() || "U";

	const isAdmin = role === "admin" || role === "owner";
	const onAdmin = pathname.startsWith("/admin");
	const onDashboard = pathname.startsWith("/dashboard");
	const label = roleLabel(role);
	const isCapsule = variant === "capsule";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label="Open account menu"
				className={cn(
					"outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					isCapsule
						? "flex items-center gap-2.5 rounded-full border border-black/10 bg-black/5 py-1.5 pl-1.5 pr-3 hover:bg-black/10 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
						: showProfile
							? "flex items-center gap-2.5 rounded-xl px-1 py-1 hover:bg-muted/60"
							: "rounded-full",
				)}
			>
				<Avatar
					className={cn(
						"shrink-0 transition",
						isCapsule
							? "size-8 border border-black/10 dark:border-white/20"
							: showProfile
								? "size-10 border-2 border-primary/25 hover:border-primary/50"
								: "size-9 border-2 border-primary/25 hover:border-primary/50",
					)}
				>
					<AvatarFallback
						className={cn(
							"text-xs font-semibold",
							isCapsule
								? "bg-black/10 text-black dark:bg-white/15 dark:text-white"
								: "bg-primary/10 text-sm text-primary",
						)}
					>
						{initials}
					</AvatarFallback>
				</Avatar>

				{(showProfile || isCapsule) && (
					<>
						<div
							className={cn(
								"min-w-0 text-left",
								isCapsule
									? "hidden max-w-[160px] sm:block lg:max-w-[200px]"
									: "hidden max-w-[140px] sm:block lg:max-w-[180px]",
							)}
						>
							<p
								className={cn(
									"truncate text-sm font-semibold leading-tight",
									isCapsule
										? "text-black dark:text-white"
										: "text-foreground",
								)}
							>
								{name}
							</p>
							{email ? (
								<p
									className={cn(
										"truncate text-xs",
										isCapsule
											? "text-black/55 dark:text-white/60"
											: "text-muted-foreground",
									)}
								>
									{email}
								</p>
							) : (
								<p
									className={cn(
										"truncate text-xs capitalize",
										isCapsule
											? "text-black/55 dark:text-white/60"
											: "text-muted-foreground",
									)}
								>
									{label}
								</p>
							)}
						</div>
						{!isCapsule && isAdmin && (
							<span className="hidden rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary sm:inline">
								Admin
							</span>
						)}
						<ChevronDown
							className={cn(
								"hidden size-4 shrink-0 sm:block",
								isCapsule
									? "text-black/50 dark:text-white/70"
									: "text-muted-foreground",
							)}
						/>
					</>
				)}
			</DropdownMenuTrigger>

			<DropdownMenuContent align={align} className="w-64">
				<DropdownMenuLabel className="flex flex-col gap-1 py-2">
					<span className="truncate text-sm font-semibold">{name}</span>
					{email && (
						<span className="truncate text-xs font-normal text-muted-foreground">
							{email}
						</span>
					)}
					<span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
						{isAdmin && <Shield className="size-3" />}
						{label}
					</span>
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				<p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
					Switch workspace
				</p>

				<DropdownMenuItem asChild className="cursor-pointer gap-2">
					<Link href="/dashboard" className="flex w-full items-center gap-2">
						<LayoutDashboard className="size-4" />
						<span className="flex-1">Dashboard</span>
						{onDashboard && <Check className="size-4 text-primary" />}
					</Link>
				</DropdownMenuItem>

				{isAdmin && (
					<DropdownMenuItem asChild className="cursor-pointer gap-2">
						<Link href="/admin" className="flex w-full items-center gap-2">
							<Shield className="size-4" />
							<span className="flex-1">Admin console</span>
							{onAdmin && <Check className="size-4 text-primary" />}
						</Link>
					</DropdownMenuItem>
				)}

				<DropdownMenuSeparator />

				<form action={logoutAction}>
					<DropdownMenuItem
						asChild
						className="cursor-pointer gap-2 text-destructive focus:text-destructive"
					>
						<button type="submit" className="flex w-full items-center gap-2">
							<LogOut className="size-4" />
							Sign out
						</button>
					</DropdownMenuItem>
				</form>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
