import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppShellHeader } from "@/components/app-shell-header";
import type { SidebarNavItem } from "@/components/sidebar-nav-content";
import { logoutAction } from "@/server/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getCurrentUser } from "@/lib/auth";

const nav: SidebarNavItem[] = [
	{ href: "/dashboard", label: "Overview", icon: "layout-dashboard", exact: true },
	{ href: "/dashboard/jobs", label: "My jobs", icon: "briefcase" },
	{ href: "/dashboard/jobs/new", label: "Post a job", icon: "plus" },
	{ href: "/dashboard/payments", label: "Payments", icon: "receipt" },
	{ href: "/dashboard/analytics", label: "Analytics", icon: "trending-up" },
	{ href: "/dashboard/settings", label: "Settings", icon: "settings" },
];

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await getCurrentUser();
	if (!user) redirect("/login?next=/dashboard");

	const displayName = user.displayName ?? user.email ?? "User";
	const initials = displayName
		.split(/\s+/)
		.map((s) => s[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const sidebarFooter = (
		<div className="space-y-3">
			<div className="flex items-center gap-2.5 rounded-lg border bg-background/60 p-2">
				<Avatar className="size-8">
					<AvatarFallback className="bg-primary/15 text-primary">
						{initials}
					</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex-1">
					<p className="line-clamp-1 text-sm font-medium">{displayName}</p>
					<p className="line-clamp-1 text-xs text-muted-foreground capitalize">
						{user.role}
					</p>
				</div>
			</div>
			<form action={logoutAction}>
				<Button
					variant="ghost"
					size="sm"
					className="h-11 w-full justify-start text-muted-foreground hover:text-foreground"
				>
					Sign out
				</Button>
			</form>
		</div>
	);

	const sidebarProps = {
		brand: process.env.NEXT_PUBLIC_APP_NAME ?? "JobPost",
		homeHref: "/" as const,
		nav,
		footer: sidebarFooter,
	};

	return (
		<div className="flex min-h-screen overflow-x-hidden bg-muted/20">
			<AppSidebar {...sidebarProps} />

			<div className="flex min-w-0 flex-1 flex-col">
				<AppShellHeader
					{...sidebarProps}
					leading={
						<div className="min-w-0">
							<span className="hidden text-xs font-semibold uppercase tracking-wider text-primary md:inline">
								Employer dashboard
							</span>
							<span className="hidden text-muted-foreground/40 md:inline">
								{" "}
								·{" "}
							</span>
							<span className="line-clamp-2 text-xs font-medium text-muted-foreground sm:text-sm md:line-clamp-1">
								Welcome back, {displayName.split(/\s+/)[0]}
							</span>
						</div>
					}
					actions={
						<>
							<Button asChild className="hidden h-11 sm:inline-flex">
								<Link href="/dashboard/jobs/new">
									<Plus className="size-4" /> New job
								</Link>
							</Button>
							<Button
								asChild
								size="icon"
								className="size-11 sm:hidden"
								aria-label="Post a new job"
							>
								<Link href="/dashboard/jobs/new">
									<Plus className="size-4" />
								</Link>
							</Button>
							<ThemeToggle />
							<UserMenu
								name={displayName}
								email={user.email}
								role={user.role}
							/>
						</>
					}
				/>

				<main className="flex-1 overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">
					<div className="mx-auto w-full max-w-7xl min-w-0">{children}</div>
				</main>
			</div>
		</div>
	);
}
