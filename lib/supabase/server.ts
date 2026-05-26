import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Per-request Supabase client bound to the user's auth cookies.
 * Use this from Server Components, Server Actions, Route Handlers.
 *
 * Note (Next.js 16): `cookies()` is async — must `await`.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(values: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            for (const { name, value, options } of values) {
              cookieStore.set(name, value, options as never);
            }
          } catch {
            // Server Component called from a context that can't write cookies.
            // Safe to ignore — proxy.ts refreshes the session on every request.
          }
        },
      },
    },
  );
}

/**
 * Service-role client. Bypasses Row Level Security.
 * NEVER expose to the browser. Use for admin tasks and cross-user reads.
 */
export function createSupabaseServiceClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
