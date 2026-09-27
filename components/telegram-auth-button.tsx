"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { ExternalLink, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type TelegramAuthButtonProps = {
  mode: "login" | "signup";
  nextPath?: string;
};

type PollStatus =
  | "pending"
  | "ready"
  | "expired"
  | "cancelled"
  | "not_found"
  | "consumed"
  | "invalid";

export function TelegramAuthButton({
  mode,
  nextPath = "/post/new",
}: TelegramAuthButtonProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const [waiting, setWaiting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (!waiting || !sessionId) return;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/auth/telegram/web-session?id=${encodeURIComponent(sessionId)}`,
          { credentials: "include" },
        );
        const data = (await res.json()) as {
          status?: PollStatus;
          redirect?: string;
          error?: string;
        };

        if (data.status === "pending") return;

        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        setWaiting(false);
        setSessionId(null);

        if (data.status === "ready" || data.status === "consumed") {
          toast.success(t("telegramLoginSuccess"));
          router.replace(data.redirect || nextPath);
          router.refresh();
          return;
        }

        if (data.status === "cancelled") {
          toast.message(t("telegramLoginCancelled"));
          return;
        }

        toast.error(t("telegramLoginExpired"));
      } catch {
        // Keep polling on transient network errors.
      }
    };

    void poll();
    pollRef.current = setInterval(poll, 2000);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [waiting, sessionId, nextPath, router, t]);

  if (!botUsername) return null;

  const startLogin = async () => {
    try {
      setWaiting(true);
      const res = await fetch("/api/auth/telegram/web-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ next: nextPath }),
      });
      const data = (await res.json()) as {
        id?: string;
        botUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.id || !data.botUrl) {
        throw new Error(data.error || "Could not start Telegram login");
      }
      setSessionId(data.id);
      window.open(data.botUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setWaiting(false);
      setSessionId(null);
      toast.error(
        err instanceof Error ? err.message : t("telegramLoginExpired"),
      );
    }
  };

  const cancelWaiting = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setWaiting(false);
    setSessionId(null);
  };

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

        {waiting ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-[#2AABEE]/30 bg-background/80 px-3 py-3">
              <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-[#2AABEE]" />
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium">{t("telegramWaitingTitle")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("telegramWaitingBody")}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-full"
              onClick={cancelWaiting}
            >
              {t("telegramWaitingCancel")}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full border-[#2AABEE]/40 bg-background text-[#229ED9] hover:bg-[#2AABEE]/10 hover:text-[#1a8bc4]"
            onClick={() => void startLogin()}
          >
            <Send className="size-4" />
            {mode === "signup" ? t("openTelegramSignup") : t("openTelegram")}
            <ExternalLink className="size-3.5 opacity-60" />
          </Button>
        )}

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
