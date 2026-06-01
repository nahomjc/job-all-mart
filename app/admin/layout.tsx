import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, ExternalLink, Shield } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppShellHeader } from "@/components/app-shell-header";
import type { SidebarNavItem } from "@/components/sidebar-nav-content";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/server/actions/auth";
import { getCurrentUser } from "@/lib/auth";

const nav: SidebarNavItem[] = [
	{ href: "/admin", label: "Overview", icon: "gauge", exact: true },
	{ href: "/admin/jobs", label: "Approval queue", icon: "briefcase" },
	{ href: "/admin/payments", label: "Payments", icon: "receipt" },
	{ href: "/admin/users", label: "Users", icon: "users" },
	{ href: "/admin/categories", label: "Categories", icon: "folder-kanban" },
	{ href: "/admin/audit", label: "Audit logs", icon: "scroll-text" },
];

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await getCurrentUser();
	if (!user) redirect("/login?next=/admin");
	if (user.role !== "admin" && user.role !== "owner") {
		return (
			<div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
				<div className="w-full max-w-md text-center">
					<span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
						<AlertCircle className="size-7" />
					</span>
					<h1 className="mt-4 text-xl font-bold sm:text-2xl">Access denied</h1>
					<p className="mt-1 text-sm text-muted-foreground sm:text-base">
						Your account does not have admin access.
					</p>
					<Button asChild className="mt-4 h-11 w-full sm:w-auto">
						<Link href="/dashboard">Back to dashboard</Link>
					</Button>
				</div>
			</div>
		);
	}

	const roleBadge = (
		<span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
			<Shield className="size-3" />
			{user.role}
		</span>
	);

	const sidebarFooter = (
		<form action={logoutAction}>
			<Button
				variant="ghost"
				size="sm"
				className="h-11 w-full justify-start text-muted-foreground hover:text-foreground"
			>
				Sign out
			</Button>
		</form>
	);

	const displayName = user.displayName ?? user.email ?? "Administrator";

	const sidebarProps = {
		brand: "Admin",
		homeHref: "/admin" as const,
		badge: roleBadge,
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
								Admin console
							</span>
							<span className="hidden text-muted-foreground/40 md:inline">
								{" "}
								·{" "}
							</span>
							<span className="line-clamp-2 text-xs font-medium text-muted-foreground sm:text-sm md:line-clamp-1">
								<span className="md:hidden">Admin · </span>
								{displayName}
							</span>
						</div>
					}
					actions={
						<>
							<Button
								asChild
								variant="ghost"
								size="sm"
								className="hidden h-11 sm:inline-flex"
							>
								<Link href="/">View site</Link>
							</Button>
							<Button
								asChild
								variant="ghost"
								size="icon"
								className="size-11 sm:hidden"
								aria-label="View site"
							>
								<Link href="/">
									<ExternalLink className="size-4" />
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
