import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";

export async function Navbar() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Briefcase className="size-4" />
          </span>
          <span className="text-lg tracking-tight">
            {env.NEXT_PUBLIC_APP_NAME}
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/jobs" className="hover:text-primary transition-colors">
            Browse jobs
          </Link>
          <Link href="/pricing" className="hover:text-primary transition-colors">
            Pricing
          </Link>
          {user?.role === "admin" || user?.role === "owner" ? (
            <Link href="/admin" className="hover:text-primary transition-colors">
              Admin
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <UserMenu
              name={user.displayName ?? user.email ?? "User"}
              email={user.email}
              role={user.role}
            />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/login?mode=signup">Post a job</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
