import { NextResponse } from "next/server";
import { z } from "zod";
import { safeNextPath } from "@/lib/safe-next-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signInWithTelegramProfile } from "@/lib/telegram/sign-in-user";
import { telegramWebLoginRepo } from "@/server/repositories/telegramWebLogin";
import { userRepo } from "@/server/repositories/user";

const createSchema = z.object({
  next: z.string().optional(),
});

/** Create a pending web-login session (browser stays on this origin). */
export async function POST(request: Request) {
  try {
    const body = createSchema.parse(await request.json().catch(() => ({})));
    const nextPath = safeNextPath(body.next);
    const session = await telegramWebLoginRepo.create(nextPath);
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    if (!botUsername) {
      return NextResponse.json(
        { error: "Telegram bot username is not configured" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      id: session.id,
      botUrl: `https://t.me/${botUsername}?start=wl_${session.id.replace(/-/g, "")}`,
      expiresAt: session.expiresAt.toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to start login";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function uuidFromCompact(compact: string): string | null {
  const hex = compact.replace(/-/g, "").toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) return null;
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Poll from the original browser tab; completes sign-in here (same browser). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawId = url.searchParams.get("id") ?? "";
  const id = rawId.includes("-") ? rawId : uuidFromCompact(rawId);
  if (!id) {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const session = await telegramWebLoginRepo.byId(id);
  if (!session) {
    return NextResponse.json({ status: "not_found" }, { status: 404 });
  }

  if (session.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ status: "expired" });
  }

  if (session.status === "pending") {
    return NextResponse.json({ status: "pending" });
  }

  if (session.status === "cancelled") {
    return NextResponse.json({ status: "cancelled" });
  }

  if (session.status === "consumed") {
    return NextResponse.json({
      status: "consumed",
      redirect: session.nextPath,
    });
  }

  if (session.status !== "approved" || session.telegramId == null) {
    return NextResponse.json({ status: "pending" });
  }

  const consumed = await telegramWebLoginRepo.consume(session.id);
  if (!consumed || consumed.telegramId == null) {
    return NextResponse.json({ status: "consumed", redirect: session.nextPath });
  }

  const tgUser = await userRepo.byTelegramId(consumed.telegramId);
  const supabase = await createSupabaseServerClient();
  await signInWithTelegramProfile(supabase, {
    telegramId: consumed.telegramId,
    firstName: tgUser?.telegramFirstName ?? undefined,
    lastName: tgUser?.telegramLastName ?? undefined,
    username: tgUser?.telegramUsername ?? undefined,
    photoUrl: tgUser?.avatarUrl ?? undefined,
  });

  return NextResponse.json({
    status: "ready",
    redirect: consumed.nextPath,
  });
}
