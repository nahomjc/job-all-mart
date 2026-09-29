import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PublicIntroGate } from "@/components/home/intro-loader";
import { TelegramFloatDock } from "@/components/telegram-float-dock";
import { env } from "@/lib/env";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicIntroGate>
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
