"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Languages } from "lucide-react";
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

  const currentLabel = locale === "am" ? t("amharic") : t("english");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "rounded-full gap-1.5 text-black hover:bg-black/5 dark:text-white dark:hover:bg-white/10",
            compact ? "px-2.5" : "px-3",
            className,
          )}
          aria-label={t("changeLanguage")}
          title={t("changeLanguage")}
        >
          <Languages className="size-4 shrink-0" />
          <span
            className={cn(
              "font-medium",
              compact ? "text-xs" : "hidden text-xs sm:inline",
            )}
          >
            {t("language")}
          </span>
          {!compact && (
            <span className="hidden text-xs text-black/55 sm:inline dark:text-white/55">
              · {currentLabel}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[11rem]">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          {t("changeLanguage")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => switchLocale("en")}
          className={cn(
            "flex items-center justify-between gap-3",
            locale === "en" && "bg-accent",
          )}
        >
          {t("english")}
          {locale === "en" ? <Check className="size-3.5 opacity-70" /> : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchLocale("am")}
          className={cn(
            "flex items-center justify-between gap-3",
            locale === "am" && "bg-accent",
          )}
        >
          {t("amharic")}
          {locale === "am" ? <Check className="size-3.5 opacity-70" /> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
