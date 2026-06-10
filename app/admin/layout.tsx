import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, ExternalLink, LogOut, Shield } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import type { SidebarNavSection } from "@/components/sidebar-nav-content";
import { AppShellHeader } from "@/components/app-shell-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/server/actions/auth";
import { getCurrentUser } from "@/lib/auth";

const sections: SidebarNavSection[] = [
	{
		title: "MENU",
		items: [
			{ href: "/admin", label: "Dashboard", icon: "gauge", exact: true },
			{
				href: "/admin/jobs",
				label: "Approval queue",
				icon: "briefcase",
			},
			{ href: "/admin/payments", label: "Payments", icon: "receipt" },
			{ href: "/admin/users", label: "Users", icon: "users" },
			{ href: "/admin/categories", label: "Categories", icon: "folder-kanban" },
		],
	},
	{
		title: "GENERAL",
		items: [
			{ href: "/admin/audit", label: "Audit logs", icon: "scroll-text" },
			{ href: "/", label: "View site", icon: "circle-help" },
		],
	},
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
			<div className="flex min-h-screen items-center justify-center shell-canvas p-4 sm:p-6">
				<div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-lg">
					<span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
						<AlertCircle className="size-7" />
					</span>
					<h1 className="mt-4 text-xl font-bold sm:text-2xl">Access denied</h1>
					<p className="mt-1 text-sm text-muted-foreground sm:text-base">
						Your account does not have admin access.
					</p>
					<Button asChild className="mt-4 h-11 w-full rounded-xl sm:w-auto">
						<Link href="/dashboard">Back to dashboard</Link>
					</Button>
				</div>
			</div>
		);
	}

	const displayName = user.displayName ?? user.email ?? "Administrator";

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
				className="h-10 w-full justify-start gap-2 rounded-xl text-muted-foreground hover:text-foreground"
			>
				<LogOut className="size-4" />
				Logout
			</Button>
		</form>
	);

	const sidebarProps = {
		brand: "Admin",
		homeHref: "/admin" as const,
		badge: roleBadge,
		sections,
		footer: sidebarFooter,
		promo: false,
	};

	return (
		<div className="min-h-svh shell-canvas">
			<AppSidebar {...sidebarProps} />

			<div className="flex min-h-svh min-w-0 flex-col md:pl-[260px]">
				<AppShellHeader
					{...sidebarProps}
					searchPlaceholder="Search jobs, users, payments…"
					searchAction="/admin/search"
					userStrip={
						<UserMenu
							name={displayName}
							email={user.email}
							role={user.role}
							showProfile
						/>
					}
					actions={
						<>
							<Button
								asChild
								variant="outline"
								size="sm"
								className="hidden h-10 rounded-xl sm:inline-flex"
							>
								<Link href="/">
									<ExternalLink className="size-4" />
									View site
								</Link>
							</Button>
							<Button asChild size="sm" className="h-10 rounded-xl">
								<Link href="/admin/jobs?status=pending_review">
									Review queue
								</Link>
							</Button>
							<ThemeToggle />
						</>
					}
				/>

				<main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
					<div className="mx-auto w-full max-w-[1400px] min-w-0">{children}</div>
				</main>
			</div>
		</div>
	);
}
