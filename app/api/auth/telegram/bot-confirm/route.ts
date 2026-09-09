import { NextResponse } from "next/server";
import { verifyBotLoginToken } from "@/lib/telegram/bot-login-token";
import { signInWithTelegramProfile } from "@/lib/telegram/sign-in-user";
import { userRepo } from "@/server/repositories/user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-next-path";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nextPath = safeNextPath(url.searchParams.get("next"));
  const token = url.searchParams.get("token");

  try {
    if (!token) throw new Error("Missing token");
    const parsed = verifyBotLoginToken(token);
    if (!parsed) throw new Error("Invalid or expired token");

    const tgUser = await userRepo.byTelegramId(parsed.telegramId);
    const supabase = await createSupabaseServerClient();

    await signInWithTelegramProfile(supabase, {
      telegramId: parsed.telegramId,
      firstName: tgUser?.telegramFirstName ?? undefined,
      lastName: tgUser?.telegramLastName ?? undefined,
      username: tgUser?.telegramUsername ?? undefined,
      photoUrl: tgUser?.avatarUrl ?? undefined,
    });

    return NextResponse.redirect(new URL(nextPath, url.origin));
  } catch {
    const failUrl = new URL("/login", url.origin);
    failUrl.searchParams.set(
      "error",
      "Telegram login link expired or invalid. Open the bot and try again.",
    );
    return NextResponse.redirect(failUrl);
  }
}
