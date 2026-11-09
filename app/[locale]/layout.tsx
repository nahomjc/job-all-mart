import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import NextTopLoader from "nextjs-toploader";
import { resolveAppName } from "@/lib/env";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";

const appName = resolveAppName(process.env.NEXT_PUBLIC_APP_NAME);
const CANONICAL_HOST = "https://www.makadverts.com";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const homeTitle = t("homeTitle");
  const homeDescription = t("homeDescription");

  return {
    metadataBase: new URL(CANONICAL_HOST),
    title: {
      default: homeTitle,
      template: `%s · ${appName}`,
    },
    description: homeDescription,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: "/apple-icon.png",
    },
    openGraph: {
      type: "website",
      siteName: appName,
      title: homeTitle,
      description: t("ogDescription"),
      locale: locale === "am" ? "am_ET" : "en_US",
      images: [
        {
          url: `${CANONICAL_HOST}/images/photo_2026-09-27_19-36-28-Photoroom.png`,
          width: 1200,
          height: 630,
          alt: `${appName} - Jobs in Ethiopia`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: homeTitle,
      description: t("ogDescription"),
      images: [`${CANONICAL_HOST}/images/photo_2026-09-27_19-36-28-Photoroom.png`],
    },
    alternates: {
      canonical: `${CANONICAL_HOST}/${locale}`,
      languages: {
        en: `${CANONICAL_HOST}/en`,
        am: `${CANONICAL_HOST}/am`,
        "x-default": `${CANONICAL_HOST}/en`,
      },
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <NextTopLoader color="#e6c84a" height={3} showSpinner={false} />
            {children}
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
