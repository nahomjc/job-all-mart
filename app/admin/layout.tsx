import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, Shield } from "lucide-react";
import { AppSidebar, type SidebarNavItem } from "@/components/app-sidebar";
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
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertCircle className="size-7" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Access denied</h1>
          <p className="mt-1 text-muted-foreground">
            Your account does not have admin access.
          </p>
          <Button asChild className="mt-4">
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
        className="w-full justify-start text-muted-foreground hover:text-foreground"
      >
        Sign out
      </Button>
    </form>
  );

  return (
    <div className="flex min-h-screen bg-muted/20">
      <AppSidebar
        brand="Admin"
        homeHref="/admin"
        badge={roleBadge}
        nav={nav}
        footer={sidebarFooter}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-primary md:inline">
              Admin console
            </span>
            <span className="hidden text-muted-foreground/40 md:inline">·</span>
            <span className="text-sm font-medium text-muted-foreground">
              {user.displayName ?? user.email ?? "Administrator"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">View site</Link>
            </Button>
            <ThemeToggle />
            <UserMenu
              name={user.displayName ?? user.email ?? "Admin"}
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
