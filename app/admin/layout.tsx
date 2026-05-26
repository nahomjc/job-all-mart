import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertCircle,
  Briefcase,
  FolderKanban,
  Gauge,
  Receipt,
  ScrollText,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/server/actions/auth";
import { getCurrentUser } from "@/lib/auth";

const nav = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/jobs", label: "Approval queue", icon: Briefcase },
  { href: "/admin/payments", label: "Payments", icon: Receipt },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: FolderKanban },
  { href: "/admin/audit", label: "Audit logs", icon: ScrollText },
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
          <AlertCircle className="mx-auto size-10 text-destructive" />
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

  return (
    <div className="grid min-h-screen md:grid-cols-[240px_1fr]">
      <aside className="hidden border-r bg-muted/30 md:flex md:flex-col">
        <div className="border-b px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Briefcase className="size-5 text-primary" />
            Admin
          </Link>
          <Badge variant="warning" className="mt-2 text-[10px]">
            {user.role.toUpperCase()}
          </Badge>
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
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
          <span className="text-sm font-medium">Admin console</span>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
