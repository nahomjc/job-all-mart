import "server-only";

import { eq } from "drizzle-orm";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import {
  telegramSyntheticEmail,
  telegramSyntheticPassword,
} from "@/lib/telegram/web-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { userRepo } from "@/server/repositories/user";

export type TelegramProfile = {
  telegramId: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
};

export async function signInWithTelegramProfile(
  supabase: SupabaseClient,
  profile: TelegramProfile,
): Promise<void> {
  const email = telegramSyntheticEmail(profile.telegramId);
  const password = telegramSyntheticPassword(
    profile.telegramId,
    env.TELEGRAM_WEBHOOK_SECRET,
  );

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
        telegram_id: profile.telegramId,
        display_name:
          [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
          profile.username ||
          `tg_${profile.telegramId}`,
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
  if (!supaUserId) {
    throw new Error("Missing Supabase user after Telegram login");
  }

  const existingBySupabase = await db
    .select()
    .from(users)
    .where(eq(users.supabaseUserId, supaUserId))
    .limit(1);

  if (!existingBySupabase[0]) {
    const existingByTelegram = await userRepo.byTelegramId(profile.telegramId);
    if (existingByTelegram) {
      await userRepo.linkSupabase(existingByTelegram.id, supaUserId, email);
      await userRepo.upsertFromTelegram({
        telegramId: profile.telegramId,
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
    } else {
      await db.insert(users).values({
        supabaseUserId: supaUserId,
        email,
        telegramId: profile.telegramId,
        telegramUsername: profile.username,
        telegramFirstName: profile.firstName,
        telegramLastName: profile.lastName,
        avatarUrl: profile.photoUrl,
        displayName:
          [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
          profile.username ||
          `tg_${profile.telegramId}`,
        authProvider: "supabase",
        source: "web",
      });
    }
  }
}
