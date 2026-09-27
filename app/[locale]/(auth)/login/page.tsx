import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { redirectTo } from "@/i18n/redirect";
import {
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/safe-next-path";
import { buildRequiredChannelJoinUrl } from "@/lib/required-channel-links";
import { env } from "@/lib/env";

export async function generateMetadata() {
  const t = await getTranslations("auth");
  return { title: t("loginTitle") };
}

export default async function LoginPage(props: {
  searchParams: Promise<{ next?: string; mode?: string }>;
}) {
  const sp = await props.searchParams;
  const t = await getTranslations("auth");
  const tf = await getTranslations("footer");
  const user = await getCurrentUser();
  // Recovery link lands here with a session so the user can set a new password.
  if (user && sp.mode !== "reset") {
    return await redirectTo(safeNextPath(sp.next));
  }

  const brandName = env.NEXT_PUBLIC_APP_NAME;
  const tgJoinUrl = buildRequiredChannelJoinUrl({
    username: process.env.TELEGRAM_REQUIRED_CHANNEL ?? "",
    invite: process.env.TELEGRAM_REQUIRED_CHANNEL_INVITE,
  });
  const hasTgJoin = Boolean(process.env.TELEGRAM_REQUIRED_CHANNEL);

  const features = [
    {
      icon: Shield,
      title: t("featureReview"),
      body: t("featureReviewBody"),
    },
    {
      icon: CheckCircle2,
      title: t("featurePayment"),
      body: t("featurePaymentBody"),
    },
    {
      icon: Zap,
      title: t("featureTelegram"),
      body: t("featureTelegramBody"),
    },
  ];

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <div className="relative flex flex-col px-6 py-8 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold tracking-tight"
          >
            <BrandLogo size={32} priority />
            <span className="text-lg">{brandName}</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="size-3.5" />
              {t("backToHome")}
            </Link>
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <Suspense fallback={null}>
              <AuthForm />
            </Suspense>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground sm:text-left">
          {t("agreeTerms")}{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            {tf("terms")}
          </Link>{" "}
          {t("and")}{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            {t("privacyPolicy")}
          </Link>
          .
        </p>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-primary/70" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.25),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.18),transparent_45%)]"
        />
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
              {t("liveBadge")}
            </span>
            <h2 className="mt-6 max-w-md text-balance text-4xl font-bold tracking-tight">
              {t("loginSubtitle")}
            </h2>
            <p className="mt-4 max-w-md text-pretty text-primary-foreground/90">
              {t("loginBody")}
            </p>
          </div>

          <ul className="my-8 space-y-4">
            {features.map(({ icon: Icon, title, body }) => (
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

          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <span className="flex size-11 items-center justify-center rounded-xl bg-white/20">
                <TrendingUp className="size-5" />
              </span>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-primary-foreground/80">
                  {t("channelMembers")}
                </p>
                <p className="text-xl font-bold">
                  250,000+{" "}
                  <span className="text-sm font-medium text-primary-foreground/80">
                    {t("jobSeekers")}
                  </span>
                </p>
              </div>
              <span className="rounded-full bg-amber-200/30 px-2 py-0.5 text-xs font-semibold">
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
                {t("preferTelegram")}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
