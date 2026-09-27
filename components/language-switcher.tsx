"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export function LanguageSwitcher({
  className,
  compact = false,
}: LanguageSwitcherProps) {
  const t = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: AppLocale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  const label = locale === "am" ? t("amharic") : t("english");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "rounded-full gap-1.5 text-black hover:bg-black/5 dark:text-white dark:hover:bg-white/10",
            compact && "px-2",
            className,
          )}
          aria-label={t("language")}
        >
          <Languages className="size-4" />
          {!compact && (
            <span className="hidden text-xs font-medium sm:inline">{label}</span>
          )}
          {compact && (
            <span className="text-xs font-semibold uppercase">{locale}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[9rem]">
        <DropdownMenuItem
          onClick={() => switchLocale("en")}
          className={cn(locale === "en" && "bg-accent")}
        >
          {t("english")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchLocale("am")}
          className={cn(locale === "am" && "bg-accent")}
        >
          {t("amharic")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
