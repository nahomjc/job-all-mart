import { redirect as nextRedirect } from "next/navigation";
import { getLocale } from "next-intl/server";

/**
 * Locale-aware server redirect. Prefer this over next-intl's redirect()
 * which requires an explicit `{ href, locale }` object in current typings
 * and is not typed as `never` (breaks null narrowing after auth checks).
 */
export async function redirectTo(path: string): Promise<never> {
  const locale = await getLocale();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  // Avoid double-prefixing if a caller already included the locale.
  if (normalized === `/${locale}` || normalized.startsWith(`/${locale}/`)) {
    nextRedirect(normalized);
  }
  nextRedirect(`/${locale}${normalized}`);
}
