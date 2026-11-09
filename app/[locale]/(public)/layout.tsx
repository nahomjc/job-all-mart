import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PublicIntroGate } from "@/components/home/intro-loader";
import { TelegramFloatDock } from "@/components/telegram-float-dock";
import { SiteJsonLd } from "@/components/seo/site-jsonld";
import { env } from "@/lib/env";

interface PublicLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function PublicLayout({
  children,
  params,
}: PublicLayoutProps) {
  const { locale } = await params;
  
  return (
    <PublicIntroGate>
      <SiteJsonLd appName={env.NEXT_PUBLIC_APP_NAME} locale={locale} />
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 bg-background">{children}</main>
        <Footer />
        <TelegramFloatDock
          channelUrl={env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL}
          botUsername={env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}
        />
      </div>
    </PublicIntroGate>
  );
}
