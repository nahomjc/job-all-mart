import "server-only";
import { Telegraf, Context, Markup } from "telegraf";
import { env } from "@/lib/env";

declare global {
  var __telegraf: Telegraf | undefined;
}

/**
 * Singleton Telegraf instance. Re-using between webhook invocations avoids
 * the cost of re-registering middleware on every request.
 */
export function getBot(): Telegraf {
  if (global.__telegraf) return global.__telegraf;
  const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN, { handlerTimeout: 30_000 });
  global.__telegraf = bot;
  return bot;
}

export type BotContext = Context;
export { Markup };
