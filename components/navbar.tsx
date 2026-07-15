import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { CategoriesNav } from "@/components/categories-nav";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { categoryRepo } from "@/server/repositories/category";

export async function Navbar() {
  const [user, categories] = await Promise.all([
    getCurrentUser(),
    categoryRepo.list(),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <BrandLogo size={32} priority />
          <span className="text-lg tracking-tight">
            {env.NEXT_PUBLIC_APP_NAME}
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <CategoriesNav categories={categories.slice(0, 8)} />
          <Link href="/pricing" className="hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="/jobs" className="hover:text-primary transition-colors">
            Jobs
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <UserMenu
              name={user.displayName ?? user.email ?? "User"}
              email={user.email}
              role={user.role}
              showProfile={false}
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
