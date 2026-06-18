import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  MessageSquare,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { buildRequiredChannelJoinUrl } from "@/lib/required-channel-links";
import { env } from "@/lib/env";

export const metadata = {
  title: "Sign in",
};

const FEATURES = [
  {
    icon: Shield,
    title: "Moderated submissions",
    body: "Every post is reviewed by a real human before going live.",
  },
  {
    icon: CheckCircle2,
    title: "Payment-verified",
    body: "Jobs publish only after we confirm your payment screenshot.",
  },
  {
    icon: Zap,
    title: "Instant Telegram reach",
    body: "Approved posts hit the right channel topic in under 60 seconds.",
  },
];

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const brandName = env.NEXT_PUBLIC_APP_NAME;
  const tgJoinUrl = buildRequiredChannelJoinUrl({
    username: process.env.TELEGRAM_REQUIRED_CHANNEL ?? "",
    invite: process.env.TELEGRAM_REQUIRED_CHANNEL_INVITE,
  });
  const hasTgJoin = Boolean(process.env.TELEGRAM_REQUIRED_CHANNEL);

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      {/* ─────────── Left: form column ─────────── */}
      <div className="relative flex flex-col px-6 py-8 sm:px-10 lg:px-14">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold tracking-tight"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Briefcase className="size-4" />
            </span>
            <span className="text-lg">{brandName}</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="size-3.5" />
              Back to home
            </Link>
          </Button>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <Suspense fallback={null}>
              <AuthForm />
            </Suspense>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground sm:text-left">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            privacy policy
          </Link>
          .
        </p>
      </div>

      {/* ─────────── Right: brand panel ─────────── */}
      <div className="relative hidden overflow-hidden lg:block">
        {/* gradient bg */}
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-primary/70" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.25),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.18),transparent_45%)]"
        />
        {/* faint grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-size-[40px_40px]"
        />

        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-white" />
              </span>
              Live · Telegram + Web
            </span>
            <h2 className="mt-6 max-w-md text-balance text-4xl font-bold tracking-tight">
              Hire faster on the channels you already use.
            </h2>
            <p className="mt-4 max-w-md text-pretty text-primary-foreground/90">
              Post once on {brandName}, reach thousands of vetted candidates on
              Telegram and the open web — moderated, payment-verified, and live
              in under a minute.
            </p>
          </div>

          {/* Feature list */}
          <ul className="my-8 space-y-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-primary-foreground/85">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Stat card */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <span className="flex size-11 items-center justify-center rounded-xl bg-white/20">
                <TrendingUp className="size-5" />
              </span>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-primary-foreground/80">
                  Monthly reach
                </p>
                <p className="text-xl font-bold">
                  250,000+{" "}
                  <span className="text-sm font-medium text-primary-foreground/80">
                    job seekers
                  </span>
                </p>
              </div>
              <span className="rounded-full bg-sky-200/30 px-2 py-0.5 text-xs font-semibold">
                ▲ +50%
              </span>
            </div>

            {hasTgJoin && (
              <a
                href={tgJoinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary-foreground/85 underline-offset-4 hover:underline"
              >
                <MessageSquare className="size-4" />
                Prefer Telegram? Use the bot →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
