import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/server/db/client";
import { users, type User } from "@/server/db/schema";

/**
 * Resolve the current request's internal user. Returns null if the visitor is
 * not authenticated, or if the Supabase user has not yet been linked.
 *
 * Memoized with React `cache` so layout + page + actions in one request only
 * hit the database once.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: supaUser },
  } = await supabase.auth.getUser();

  if (!supaUser) return null;

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.supabaseUserId, supaUser.id))
    .limit(1);

  if (existing[0]) return existing[0];

  // First-time login: lazily create the internal user record.
  const [created] = await db
    .insert(users)
    .values({
      supabaseUserId: supaUser.id,
      email: supaUser.email ?? null,
      displayName:
        (supaUser.user_metadata?.display_name as string | undefined) ??
        supaUser.email?.split("@")[0] ??
        "User",
      authProvider: "supabase",
      source: "web",
    })
    .returning();
  return created ?? null;
});

export async function requireUser(): Promise<User> {
  const u = await getCurrentUser();
  if (!u) throw new Error("UNAUTHENTICATED");
  if (u.status !== "active") throw new Error("USER_BANNED");
  return u;
}

export async function requireAdmin(): Promise<User> {
  const u = await requireUser();
  if (u.role !== "admin" && u.role !== "owner") throw new Error("FORBIDDEN");
  return u;
}
