"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

type TelegramAuthButtonProps = {
  mode: "login" | "signup";
};

export function TelegramAuthButton({ mode }: TelegramAuthButtonProps) {
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);

  useEffect(() => {
    // Must match the browser origin (BotFather /setdomain). Do not hardcode prod URL on localhost.
    setCallbackUrl(
      `${window.location.origin}/api/auth/telegram/callback?next=/dashboard`,
    );
  }, []);

  if (!botUsername) return null;

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <div className="flex min-h-11 justify-center">
        {callbackUrl ? (
          <Script
            src="https://telegram.org/js/telegram-widget.js?22"
            strategy="afterInteractive"
            data-telegram-login={botUsername}
            data-size="large"
            data-radius="8"
            data-userpic="false"
            data-lang="en"
            data-auth-url={callbackUrl}
            data-request-access={mode === "signup" ? "write" : "read"}
          />
        ) : null}
      </div>
    </div>
  );
}
