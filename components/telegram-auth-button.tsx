"use client";

import { useTranslations } from "next-intl";
import { ExternalLink, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

type TelegramAuthButtonProps = {
  mode: "login" | "signup";
};

export function TelegramAuthButton({ mode }: TelegramAuthButtonProps) {
  const t = useTranslations("auth");
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  if (!botUsername) return null;

  const botLoginUrl = `https://t.me/${botUsername}?start=weblogin`;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#2AABEE]/25 bg-[#2AABEE]/5 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#2AABEE] text-white">
            <Send className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">{t("continueWithTelegram")}</p>
            <p className="text-xs text-muted-foreground">
              {t("preferTelegram")}
            </p>
          </div>
        </div>

        <Button
          asChild
          type="button"
          variant="outline"
          className="h-11 w-full border-[#2AABEE]/40 bg-background text-[#229ED9] hover:bg-[#2AABEE]/10 hover:text-[#1a8bc4]"
        >
          <a href={botLoginUrl} target="_blank" rel="noopener noreferrer">
            <Send className="size-4" />
            {mode === "signup" ? t("openTelegramSignup") : t("openTelegram")}
            <ExternalLink className="size-3.5 opacity-60" />
          </a>
        </Button>

        <ol className="mt-3 space-y-1 text-xs text-muted-foreground">
          <li>1. {t("telegramSteps1")}</li>
          <li>2. {t("telegramSteps2")}</li>
          <li>3. {t("telegramSteps3")}</li>
        </ol>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-background px-3 text-muted-foreground">
            {t("email")}
          </span>
        </div>
      </div>
    </div>
  );
}
