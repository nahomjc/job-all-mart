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

  const updateObj =
    update && typeof update === "object" ? (update as Record<string, unknown>) : null;
  const messageObj =
    updateObj?.message && typeof updateObj.message === "object"
      ? (updateObj.message as Record<string, unknown>)
      : null;
  const fromObj =
    messageObj?.from && typeof messageObj.from === "object"
      ? (messageObj.from as Record<string, unknown>)
      : null;
  const messageText =
    typeof messageObj?.text === "string" ? messageObj.text : undefined;

  if (messageText?.startsWith("/")) {
    console.info("[telegram webhook] command received", {
      command: messageText,
      updateId:
        typeof updateObj?.update_id === "number" ? updateObj.update_id : null,
      fromId: typeof fromObj?.id === "number" ? fromObj.id : null,
      username:
        typeof fromObj?.username === "string" ? fromObj.username : null,
      chatId:
        messageObj?.chat &&
        typeof messageObj.chat === "object" &&
        typeof (messageObj.chat as Record<string, unknown>).id === "number"
          ? (messageObj.chat as Record<string, unknown>).id
          : null,
      chatType:
        messageObj?.chat &&
        typeof messageObj.chat === "object" &&
        typeof (messageObj.chat as Record<string, unknown>).type === "string"
          ? (messageObj.chat as Record<string, unknown>).type
          : null,
    });
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
