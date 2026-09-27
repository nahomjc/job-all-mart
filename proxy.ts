import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "@/i18n/routing";

/**
 * Next.js 16 renamed middleware → proxy.
 * Runs on the Node.js runtime (no `runtime: "edge"`).
 *
 * Responsibilities:
 *   1. Locale negotiation + redirects (/jobs → /en/jobs).
 *   2. Refresh the Supabase session cookies on every request.
 *   3. Guard /{locale}/dashboard and /{locale}/admin.
 */
const handleI18nRouting = createMiddleware(routing);

function stripLocale(pathname: string): {
  locale: string;
  pathnameWithoutLocale: string;
} {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];
  if (
    maybeLocale &&
    routing.locales.includes(maybeLocale as (typeof routing.locales)[number])
  ) {
    const rest = "/" + segments.slice(2).join("/");
    return {
      locale: maybeLocale,
      pathnameWithoutLocale: rest === "/" ? "/" : rest.replace(/\/$/, "") || "/",
    };
  }
  return {
    locale: routing.defaultLocale,
    pathnameWithoutLocale: pathname,
  };
}

export default async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Email confirm / recovery links sometimes land on Site URL with ?code=
  // instead of /auth/callback — forward them so the session can be exchanged.
  if (
    (pathname === "/" || pathname === `/${routing.defaultLocale}`) &&
    searchParams.has("code")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  const response = handleI18nRouting(request);

  // If i18n redirected (missing locale prefix), return that first.
  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          values: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[],
        ) {
          for (const { name, value } of values) {
            request.cookies.set(name, value);
          }
          for (const { name, value, options } of values) {
            response.cookies.set(name, value, options as never);
          }
        },
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { locale, pathnameWithoutLocale } = stripLocale(pathname);
  const protectedPath =
    pathnameWithoutLocale.startsWith("/dashboard") ||
    pathnameWithoutLocale.startsWith("/admin");

  if (protectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set("next", pathnameWithoutLocale);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (including telegram webhook & cron — verified by their own secrets)
     * - _next internals
     * - static files with a dot (favicon.ico, images, etc.)
     * - auth/callback (OAuth exchange — unprefixed)
     */
    "/((?!api|_next|_vercel|auth/callback|.*\\..*).*)",
  ],
};
