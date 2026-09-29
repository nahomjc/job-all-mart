import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { env } from "@/lib/env";

export async function Footer() {
  const t = await getTranslations("footer");
  const tc = await getTranslations("common");
  const channelUrl = env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL;
  const botUsername = env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME.replace(/^@/, "");
  const botUrl = `https://t.me/${botUsername}?start=start`;

  return (
    <footer className="mt-24 border-t bg-muted/30">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <h3 className="mb-2 font-semibold">
            {env.NEXT_PUBLIC_APP_NAME}
          </h3>
          <p className="text-sm text-muted-foreground">
            {tc("appTagline")}
          </p>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold">{t("product")}</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><Link href="/jobs" className="hover:text-foreground">{t("browseJobs")}</Link></li>
            <li><Link href="/pricing" className="hover:text-foreground">{t("pricing")}</Link></li>
            <li><Link href="/post/new" className="hover:text-foreground">{t("postJob")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold">{t("telegram")}</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                {t("officialChannel")}
              </a>
            </li>
            <li>
              <a
                href={botUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                @{botUsername}
              </a>
            </li>
            <li>{t("telegramStart")}</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold">{t("legal")}</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><Link href="/terms" className="hover:text-foreground">{t("terms")}</Link></li>
            <li><Link href="/privacy" className="hover:text-foreground">{t("privacy")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {env.NEXT_PUBLIC_APP_NAME}. {tc("allRightsReserved")}
        </p>
        <p className="mt-1.5">
          {tc("poweredBy")}{" "}
          <a
            href="https://build-with-nahom.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground/80 underline-offset-2 transition-colors hover:text-foreground hover:underline"
          >
            Kingdom Code
          </a>
        </p>
      </div>
    </footer>
  );
}
