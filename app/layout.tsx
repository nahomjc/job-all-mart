import type { Metadata } from "next";
import { DEFAULT_APP_NAME, resolveAppName } from "@/lib/env";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const appName = resolveAppName(process.env.NEXT_PUBLIC_APP_NAME);

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: appName,
    template: `%s · ${appName}`,
  },
  description:
    "Post jobs on our Telegram channels. Moderated submissions, verified payments, instant publishing.",
  openGraph: {
    type: "website",
    title: appName,
    description: "Reach thousands of job seekers on Telegram.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
