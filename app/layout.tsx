import type { ReactNode } from "react";
import "./globals.css";

/**
 * Root layout must exist for routes outside [locale] (api, auth/callback).
 * html/body live in app/[locale]/layout.tsx per next-intl.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
