import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { CategoriesNav } from "@/components/categories-nav";
import { MobileNav } from "@/components/mobile-nav";
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
  const topCategories = categories.slice(0, 8);
  const brandName = env.NEXT_PUBLIC_APP_NAME;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <MobileNav
            brandName={brandName}
            categories={topCategories}
            signedIn={Boolean(user)}
          />
          <Link href="/" className="flex min-w-0 items-center gap-2 font-bold">
            <BrandLogo size={32} priority />
            <span className="truncate text-lg tracking-tight">{brandName}</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <CategoriesNav categories={topCategories} />
          <Link href="/pricing" className="transition-colors hover:text-primary">
            Pricing
          </Link>
          <Link href="/jobs" className="transition-colors hover:text-primary">
            Jobs
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
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
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/login?mode=signup">Post a job</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
