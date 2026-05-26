import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Next.js 16 renamed middleware → proxy.
 * Runs on the Node.js runtime (no `runtime: "edge"`).
 *
 * Responsibilities:
 *   1. Refresh the Supabase session cookies on every request.
 *   2. Guard /dashboard and /admin. /admin additionally requires admin role
 *      (the actual role check is enforced in server components/actions; here
 *      we just gate unauthenticated users).
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(values: { name: string; value: string; options?: Record<string, unknown> }[]) {
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

  const { pathname } = request.nextUrl;
  const protectedPath =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (protectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - api/telegram (webhook is verified by its own secret)
     * - api/cron     (cron is verified by its own secret)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/telegram|api/cron).*)",
  ],
};
