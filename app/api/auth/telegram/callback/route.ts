import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import {
  telegramSyntheticEmail,
  telegramSyntheticPassword,
  verifyTelegramLoginPayload,
} from "@/lib/telegram/web-auth";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { userRepo } from "@/server/repositories/user";

function safeRedirect(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nextPath = safeRedirect(url.searchParams.get("next"));

  try {
    const verified = verifyTelegramLoginPayload(
      {
        id: url.searchParams.get("id") ?? "",
        first_name: url.searchParams.get("first_name") ?? undefined,
        last_name: url.searchParams.get("last_name") ?? undefined,
        username: url.searchParams.get("username") ?? undefined,
        photo_url: url.searchParams.get("photo_url") ?? undefined,
        auth_date: url.searchParams.get("auth_date") ?? "",
        hash: url.searchParams.get("hash") ?? "",
      },
      env.TELEGRAM_BOT_TOKEN,
    );

    const email = telegramSyntheticEmail(verified.telegramId);
    const password = telegramSyntheticPassword(
      verified.telegramId,
      env.TELEGRAM_WEBHOOK_SECRET,
    );

    const supabase = await createSupabaseServerClient();
    let { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      const admin = createSupabaseServiceClient();
      const { error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          telegram_id: verified.telegramId,
          display_name:
            [verified.firstName, verified.lastName].filter(Boolean).join(" ") ||
            verified.username ||
            `tg_${verified.telegramId}`,
        },
      });
      if (createError) throw createError;

      const signInAgain = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      signInData = signInAgain.data;
      signInError = signInAgain.error;
      if (signInError) throw signInError;
    }

    const supaUserId = signInData.user?.id;
    if (!supaUserId) throw new Error("Missing Supabase user after Telegram login");

    const existingBySupabase = await db
      .select()
      .from(users)
      .where(eq(users.supabaseUserId, supaUserId))
      .limit(1);
    if (!existingBySupabase[0]) {
      const existingByTelegram = await userRepo.byTelegramId(verified.telegramId);
      if (existingByTelegram) {
        await userRepo.linkSupabase(existingByTelegram.id, supaUserId, email);
        await userRepo.upsertFromTelegram({
          telegramId: verified.telegramId,
          username: verified.username,
          firstName: verified.firstName,
          lastName: verified.lastName,
        });
      } else {
        await db.insert(users).values({
          supabaseUserId: supaUserId,
          email,
          telegramId: verified.telegramId,
          telegramUsername: verified.username,
          telegramFirstName: verified.firstName,
          telegramLastName: verified.lastName,
          avatarUrl: verified.photoUrl,
          displayName:
            [verified.firstName, verified.lastName].filter(Boolean).join(" ") ||
            verified.username ||
            `tg_${verified.telegramId}`,
          authProvider: "supabase",
          source: "web",
        });
      }
    }

    return NextResponse.redirect(new URL(nextPath, url.origin));
  } catch {
    const failUrl = new URL("/login", url.origin);
    failUrl.searchParams.set("error", "Telegram login failed. Please try again.");
    return NextResponse.redirect(failUrl);
  }
}
