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
		<header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
			<div className="pointer-events-auto mx-auto max-w-5xl">
				<div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-full border border-border/70 bg-background/85 px-2.5 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:h-[3.75rem] sm:gap-3 sm:px-3 dark:border-white/10 dark:bg-black/50 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
					{/* Left: brand */}
					<div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
						<MobileNav
							brandName={brandName}
							categories={topCategories}
							signedIn={Boolean(user)}
						/>
						<Link
							href="/"
							className="flex min-w-0 items-center gap-2 font-bold text-black dark:text-white"
						>
							<BrandLogo size={30} priority />
							<span className="truncate text-sm font-semibold tracking-tight sm:text-[15px]">
								{brandName}
							</span>
						</Link>
					</div>

					{/* Center: nav */}
					<nav className="hidden items-center justify-center gap-6 text-[13px] text-black/70 md:flex dark:text-white/70">
						<CategoriesNav categories={topCategories} />
						<Link
							href="/jobs"
							className="transition-colors hover:text-black dark:hover:text-white"
						>
							Jobs
						</Link>
						<Link
							href="/pricing"
							className="transition-colors hover:text-black dark:hover:text-white"
						>
							Pricing
						</Link>
						<Link
							href="/login?mode=signup"
							className="transition-colors hover:text-black dark:hover:text-white"
						>
							Post a job
						</Link>
					</nav>

					{/* Right: actions / profile pill */}
					<div className="flex items-center justify-end gap-1.5 sm:gap-2">
						<ThemeToggle className="rounded-full text-black hover:bg-black/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-white" />
						{user ? (
							<UserMenu
								name={user.displayName ?? user.email ?? "User"}
								email={user.email}
								role={user.role}
								variant="capsule"
								showProfile
							/>
						) : (
							<>
								<Button
									asChild
									variant="ghost"
									size="sm"
									className="hidden rounded-full text-black hover:bg-black/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-white sm:inline-flex"
								>
									<Link href="/login">Sign in</Link>
								</Button>
								<Button
									asChild
									size="sm"
									className="hidden rounded-full sm:inline-flex"
								>
									<Link href="/login?mode=signup">Post a job</Link>
								</Button>
							</>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
