import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { redirectTo } from "@/i18n/redirect";
import { LogOut, Plus, Upload } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import type { SidebarNavSection } from "@/components/sidebar-nav-content";
import { AppShellHeader } from "@/components/app-shell-header";
import { DashboardTour } from "@/components/onboarding/dashboard-tour";
import { TourReplayButton } from "@/components/onboarding/tour-replay-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { logoutAction } from "@/server/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await getCurrentUser();
	if (!user) {
		return await redirectTo("/login?next=/dashboard");
	}

	const t = await getTranslations("dashboard");
	const tc = await getTranslations("common");
	const tn = await getTranslations("nav");

	const sections: SidebarNavSection[] = [
		{
			title: t("menu"),
			items: [
				{
					href: "/dashboard",
					label: t("title"),
					icon: "layout-dashboard",
					exact: true,
					dataTour: "nav-dashboard",
				},
				{
					href: "/dashboard/jobs",
					label: t("myJobs"),
					icon: "briefcase",
					dataTour: "nav-jobs",
				},
				{
					href: "/dashboard/jobs/new",
					label: t("postJob"),
					icon: "plus",
					dataTour: "nav-post-job",
				},
				{ href: "/dashboard/payments", label: t("payments"), icon: "receipt" },
				{
					href: "/dashboard/analytics",
					label: t("analytics"),
					icon: "trending-up",
				},
			],
		},
		{
			title: t("general"),
			items: [
				{ href: "/dashboard/settings", label: t("settings"), icon: "settings" },
				{ href: "/pricing", label: t("help"), icon: "circle-help" },
			],
		},
	];

	const displayName = user.displayName ?? user.email ?? tc("user");
	const brandName = env.NEXT_PUBLIC_APP_NAME;

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
		sections,
		footer: sidebarFooter,
		promo: true,
	};

	return (
		<div className="min-h-svh shell-canvas">
			<DashboardTour />
			<AppSidebar {...sidebarProps} />

			<div className="flex min-h-svh min-w-0 flex-col md:pl-[260px]">
				<AppShellHeader
					{...sidebarProps}
					searchPlaceholder={`${tc("search")}…`}
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
							<TourReplayButton tourKey="dashboard" />
							<Button
								asChild
								variant="outline"
								size="sm"
								className="hidden h-9 rounded-full sm:inline-flex"
							>
								<Link href="/dashboard/jobs">
									<Upload className="size-4" />
									{t("myJobs")}
								</Link>
							</Button>
							<Button asChild size="sm" className="h-9 rounded-full px-4">
								<Link href="/post/new">
									<Plus className="size-4" />
									<span className="hidden sm:inline">{tn("postJob")}</span>
									<span className="sm:hidden">{tn("postJob")}</span>
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
