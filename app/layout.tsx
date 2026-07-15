import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
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
    "Post jobs to Telegram and the website. Reviewed and payment-checked before going live.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    title: appName,
    description: "Job posts for Telegram channels and the web.",
    images: [{ url: "/logo.png" }],
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
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="#e6c84a" height={3} showSpinner={false} />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
