import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Briefcase,
  LayoutDashboard,
  Plus,
  Receipt,
  Settings,
  TrendingUp,
} from "lucide-react";
import { logoutAction } from "@/server/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getCurrentUser } from "@/lib/auth";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/jobs", label: "My jobs", icon: Briefcase },
  { href: "/dashboard/jobs/new", label: "Post a job", icon: Plus },
  { href: "/dashboard/payments", label: "Payments", icon: Receipt },
  { href: "/dashboard/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const initials =
    (user.displayName ?? user.email ?? "U")
      .split(/\s+/)
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="grid min-h-screen md:grid-cols-[240px_1fr]">
      <aside className="hidden border-r bg-muted/30 md:flex md:flex-col">
        <div className="border-b px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Briefcase className="size-5 text-primary" />
            {process.env.NEXT_PUBLIC_APP_NAME ?? "JobPost"}
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 p-2 text-sm">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-3">
          <div className="mb-2 flex items-center gap-2">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-medium">
                {user.displayName ?? user.email}
              </p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
          <span className="text-sm font-medium">Employer dashboard</span>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
