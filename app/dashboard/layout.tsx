import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Plus, Upload } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import type { SidebarNavSection } from "@/components/sidebar-nav-content";
import { AppShellHeader } from "@/components/app-shell-header";
import { logoutAction } from "@/server/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";

const sections: SidebarNavSection[] = [
	{
		title: "MENU",
		items: [
			{
				href: "/dashboard",
				label: "Dashboard",
				icon: "layout-dashboard",
				exact: true,
			},
			{ href: "/dashboard/jobs", label: "My jobs", icon: "briefcase" },
			{ href: "/dashboard/jobs/new", label: "Post a job", icon: "plus" },
			{ href: "/dashboard/payments", label: "Payments", icon: "receipt" },
			{ href: "/dashboard/analytics", label: "Analytics", icon: "trending-up" },
		],
	},
	{
		title: "GENERAL",
		items: [
			{ href: "/dashboard/settings", label: "Settings", icon: "settings" },
			{ href: "/pricing", label: "Help", icon: "circle-help" },
		],
	},
];

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await getCurrentUser();
	if (!user) redirect("/login?next=/dashboard");

	const displayName = user.displayName ?? user.email ?? "User";
	const brandName = env.NEXT_PUBLIC_APP_NAME;

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
		brand: brandName,
		homeHref: "/dashboard" as const,
		sections,
		footer: sidebarFooter,
		promo: true,
	};

	return (
		<div className="flex min-h-screen overflow-x-hidden shell-canvas">
			<AppSidebar {...sidebarProps} />

			<div className="flex min-w-0 flex-1 flex-col">
				<AppShellHeader
					{...sidebarProps}
					searchPlaceholder="Search your jobs, payments…"
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
								<Link href="/dashboard/jobs">
									<Upload className="size-4" />
									Import
								</Link>
							</Button>
							<Button asChild size="sm" className="h-10 rounded-xl px-4">
								<Link href="/dashboard/jobs/new">
									<Plus className="size-4" />
									<span className="hidden sm:inline">New job</span>
									<span className="sm:hidden">New</span>
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
