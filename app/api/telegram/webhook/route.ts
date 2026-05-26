import { NextResponse, type NextRequest } from "next/server";
import { getBot } from "@/lib/telegram/bot";
import { registerHandlers } from "@/lib/telegram/handlers";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Telegram webhook endpoint.
 *
 * Telegram sends a configurable secret in the
 * `X-Telegram-Bot-Api-Secret-Token` header — we set it when running the
 * `bot:set-webhook` script. Reject any request that doesn't match.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const bot = getBot();
  registerHandlers(bot);

  let update: unknown;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  // We must respond quickly. Process the update but do not await long work.
  try {
    await bot.handleUpdate(update as Parameters<typeof bot.handleUpdate>[0]);
  } catch (err) {
    console.error("[telegram webhook] error handling update:", err);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ status: "telegram webhook live" });
}
