import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { redirectTo } from "@/i18n/redirect";
import { AlertCircle, LogOut, Shield } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import type { SidebarNavSection } from "@/components/sidebar-nav-content";
import { AppShellHeader } from "@/components/app-shell-header";
import { AdminTour } from "@/components/onboarding/admin-tour";
import { TourReplayButton } from "@/components/onboarding/tour-replay-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/server/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const t = await getTranslations("admin");
	const tc = await getTranslations("common");
	const user = await getCurrentUser();
	if (!user) {
		return await redirectTo("/login?next=/admin");
	}
	if (user.role !== "admin" && user.role !== "owner") {
		return (
			<div className="flex min-h-screen items-center justify-center shell-canvas p-4 sm:p-6">
				<div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
					<span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
						<AlertCircle className="size-7" />
					</span>
					<h1 className="mt-4 text-xl font-semibold sm:text-2xl">
						{t("accessDenied")}
					</h1>
					<p className="mt-1 text-sm text-muted-foreground sm:text-base">
						{t("accessDeniedBody")}
					</p>
					<Button asChild className="mt-4 h-11 w-full rounded-xl sm:w-auto">
						<Link href="/dashboard">{t("backToDashboard")}</Link>
					</Button>
				</div>
			</div>
		);
	}

	const sections: SidebarNavSection[] = [
		{
			title: t("overviewSection"),
			items: [
				{
					href: "/admin",
					label: t("overview"),
					icon: "gauge",
					exact: true,
					dataTour: "nav-dashboard",
				},
				{
					href: "/admin/jobs",
					label: t("approvalQueue"),
					icon: "briefcase",
					dataTour: "nav-queue",
				},
				{
					href: "/admin/payments",
					label: t("payments"),
					icon: "receipt",
					dataTour: "nav-payments",
				},
				{ href: "/admin/users", label: t("users"), icon: "users" },
				{
					href: "/admin/categories",
					label: t("categories"),
					icon: "folder-kanban",
				},
				{ href: "/admin/pricing", label: t("pricing"), icon: "tags" },
			],
		},
		{
			title: t("systemSection"),
			items: [
				{
					href: "/admin/settings",
					label: t("settings"),
					icon: "settings",
					dataTour: "nav-settings",
				},
				{ href: "/admin/audit", label: t("auditLogs"), icon: "scroll-text" },
				{ href: "/", label: t("viewSite"), icon: "circle-help" },
			],
		},
	];

	const displayName = user.displayName ?? user.email ?? tc("user");
	const brandName = env.NEXT_PUBLIC_APP_NAME;

	const roleBadge = (
		<span className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
			<Shield className="size-3 text-primary" />
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
				{tc("logout")}
			</Button>
		</form>
	);

	const sidebarProps = {
		brand: brandName,
		homeHref: "/" as const,
		badge: roleBadge,
		sections,
		footer: sidebarFooter,
		promo: false,
	};

	return (
		<div className="min-h-svh shell-canvas">
			<AdminTour />
			<AppSidebar {...sidebarProps} />

			<div className="flex min-h-svh min-w-0 flex-col md:pl-[260px]">
				<AppShellHeader
					{...sidebarProps}
					searchPlaceholder={`${tc("search")}…`}
					searchAction="/admin/search"
					userStrip={
						<UserMenu
							name={displayName}
							email={user.email}
							role={user.role}
							variant="capsule"
							showProfile
						/>
					}
					actions={
						<>
							<LanguageSwitcher compact />
							<ThemeToggle className="rounded-full text-black hover:bg-black/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-white" />
							<TourReplayButton tourKey="admin" />
							<Button asChild size="sm" className="h-9 rounded-full px-4">
								<Link href="/admin/jobs?status=pending_review">
									{t("reviewQueue")}
								</Link>
							</Button>
						</>
					}
				/>

				<main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
					<div className="mx-auto w-full max-w-[1280px] min-w-0">{children}</div>
				</main>
			</div>
		</div>
	);
}
