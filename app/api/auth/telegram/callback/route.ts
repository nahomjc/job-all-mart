import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { verifyTelegramLoginPayload } from "@/lib/telegram/web-auth";
import { signInWithTelegramProfile } from "@/lib/telegram/sign-in-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-next-path";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nextPath = safeNextPath(url.searchParams.get("next"));

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

    const supabase = await createSupabaseServerClient();
    await signInWithTelegramProfile(supabase, {
      telegramId: verified.telegramId,
      firstName: verified.firstName,
      lastName: verified.lastName,
      username: verified.username,
      photoUrl: verified.photoUrl,
    });

    return NextResponse.redirect(new URL(nextPath, url.origin));
  } catch {
    const failUrl = new URL("/login", url.origin);
    failUrl.searchParams.set("error", "Telegram login failed. Please try again.");
    return NextResponse.redirect(failUrl);
  }
}
