import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { AppSidebar, type SidebarNavItem } from "@/components/app-sidebar";
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
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          Sign out
        </Button>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/20">
      <AppSidebar
        brand={process.env.NEXT_PUBLIC_APP_NAME ?? "JobPost"}
        homeHref="/"
        nav={nav}
        footer={sidebarFooter}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-primary md:inline">
              Employer dashboard
            </span>
            <span className="hidden text-muted-foreground/40 md:inline">·</span>
            <span className="text-sm font-medium text-muted-foreground">
              Welcome back, {displayName.split(/\s+/)[0]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm">
              <Link href="/dashboard/jobs/new">
                <Plus className="size-4" /> New job
              </Link>
            </Button>
            <ThemeToggle />
            <UserMenu
              name={displayName}
              email={user.email}
              role={user.role}
            />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
