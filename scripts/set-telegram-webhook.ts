/**
 * Sets the Telegram webhook to point at this app and registers the secret
 * token Telegram will send with every update.
 *
 * Usage:
 *   tsx scripts/set-telegram-webhook.ts <https://your-domain/api/telegram/webhook>
 *
 * Or set NEXT_PUBLIC_APP_URL in .env and run with no argument.
 */
import "dotenv/config";
import { Telegraf } from "telegraf";

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!token || !secret) {
    throw new Error("TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET are required.");
  }

  const arg = process.argv[2];
  const base = arg ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!base) {
    throw new Error(
      "Pass the public webhook URL as argv[2], or set NEXT_PUBLIC_APP_URL.",
    );
  }
  const url = arg ? arg : `${base.replace(/\/$/, "")}/api/telegram/webhook`;

  const bot = new Telegraf(token);

  console.log("Removing previous webhook...");
  await bot.telegram.deleteWebhook({ drop_pending_updates: false });

  console.log(`Setting webhook to: ${url}`);
  await bot.telegram.setWebhook(url, {
    secret_token: secret,
    drop_pending_updates: false,
    allowed_updates: ["message", "callback_query", "my_chat_member"],
  });

  const info = await bot.telegram.getWebhookInfo();
  console.log("Webhook info:", info);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
