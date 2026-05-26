/**
 * Local-development bot runner. Uses long-polling instead of a webhook so you
 * don't need a public URL when iterating locally.
 *
 * Usage:
 *   npm run bot:dev
 *
 * In production, use the webhook (set via `npm run bot:set-webhook`).
 */
import "dotenv/config";
import { getBot } from "../lib/telegram/bot";
import { registerHandlers } from "../lib/telegram/handlers";

async function main() {
  const bot = getBot();
  registerHandlers(bot);

  // Make sure no webhook is set, otherwise long-polling will conflict.
  await bot.telegram.deleteWebhook({ drop_pending_updates: false });

  console.log("Starting bot in polling mode...");
  await bot.launch();

  // Graceful shutdown
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
