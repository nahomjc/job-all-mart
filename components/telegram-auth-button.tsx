"use client";

import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { Send } from "lucide-react";

type TelegramAuthButtonProps = {
  mode: "login" | "signup";
};

function subscribeNoop() {
  return () => {};
}

function getClientOrigin(): string {
  return window.location.origin;
}

function getServerOrigin(): string {
  return "";
}

export function TelegramAuthButton({ mode }: TelegramAuthButtonProps) {
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const containerRef = useRef<HTMLDivElement>(null);
  const origin = useSyncExternalStore(
    subscribeNoop,
    getClientOrigin,
    getServerOrigin,
  );

  const callbackUrl = origin
    ? `${origin}/api/auth/telegram/callback?next=/dashboard`
    : null;

  useLayoutEffect(() => {
    const host = containerRef.current;
    if (!host || !botUsername || !callbackUrl) return;

    host.replaceChildren();
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-auth-url", callbackUrl);
    script.setAttribute(
      "data-request-access",
      mode === "signup" ? "write" : "read",
    );
    host.appendChild(script);

    return () => host.replaceChildren();
  }, [botUsername, callbackUrl, mode]);

  if (!botUsername) return null;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#2AABEE]/25 bg-[#2AABEE]/5 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#2AABEE] text-white">
            <Send className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">Continue with Telegram</p>
            <p className="text-xs text-muted-foreground">
              {mode === "signup"
                ? "Create an account without email"
                : "Fast sign-in with your Telegram account"}
            </p>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex min-h-11 w-full items-center justify-center overflow-hidden rounded-lg bg-background py-1 [&_iframe]:mx-auto [&_iframe]:max-w-full"
        >
          {!callbackUrl ? (
            <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
          ) : null}
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-background px-3 text-muted-foreground">
            or continue with email
          </span>
        </div>
      </div>
    </div>
  );
}
