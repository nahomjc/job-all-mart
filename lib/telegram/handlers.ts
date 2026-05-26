import "server-only";
import type { Telegraf } from "telegraf";
import { env } from "@/lib/env";
import { userRepo } from "@/server/repositories/user";
import { jobRepo } from "@/server/repositories/job";
import {
  clearDraft,
  ensureCanPost,
  handleCategoryPick,
  handleWizardMessage,
  startDraft,
} from "@/lib/telegram/wizard";
import { formatSalary, statusLabel } from "@/lib/format";

let registered = false;

/**
 * Idempotently registers all command + message handlers on the bot.
 * Safe to call once per cold start.
 */
export function registerHandlers(bot: Telegraf): void {
  if (registered) return;
  registered = true;

  bot.start(async (ctx) => {
    const from = ctx.from;
    if (!from) return;
    await userRepo.upsertFromTelegram({
      telegramId: from.id,
      username: from.username,
      firstName: from.first_name,
      lastName: from.last_name,
    });
    await ctx.reply(
      `Welcome to ${env.NEXT_PUBLIC_APP_NAME}! 👋\n\n` +
        "I help you post jobs to our Telegram channels.\n\n" +
        "Available commands:\n" +
        "• /postjob – submit a new job\n" +
        "• /myjobs – view your submissions\n" +
        "• /pricing – view our plans\n" +
        "• /help – show this message\n\n" +
        `Before posting, make sure you've joined @${env.TELEGRAM_REQUIRED_CHANNEL}.`,
    );
  });

  bot.help(async (ctx) => {
    await ctx.reply(
      "Commands:\n" +
        "/postjob – guided job submission\n" +
        "/myjobs – list your posts and their status\n" +
        "/pricing – view our plans\n" +
        "/cancel – cancel an in-progress submission",
    );
  });

  bot.command("pricing", async (ctx) => {
    await ctx.reply(
      "💎 Pricing\n\n" +
        "• Free: 1 post / 30 days\n" +
        "• Basic ($10/post): goes live in <2h after admin approval\n" +
        "• Pro ($25/post): featured + pinned for 24h\n" +
        "• Enterprise: contact admin\n\n" +
        `Full details: ${env.NEXT_PUBLIC_APP_URL}/pricing`,
    );
  });

  bot.command("cancel", async (ctx) => {
    if (!ctx.from) return;
    clearDraft(ctx.from.id);
    await ctx.reply("Cancelled. Run /postjob to start over.");
  });

  bot.command("postjob", async (ctx) => {
    if (!ctx.from) return;
    const check = await ensureCanPost(ctx);
    if (!check.ok) {
      await ctx.reply(check.reason);
      return;
    }
    startDraft(ctx.from.id);
    await ctx.reply(
      "Let's create a job post. ✏️\n\nFirst — what's the job title?",
    );
  });

  bot.command("myjobs", async (ctx) => {
    if (!ctx.from) return;
    const user = await userRepo.byTelegramId(ctx.from.id);
    if (!user) {
      await ctx.reply("Run /start first.");
      return;
    }
    const rows = await jobRepo.listByUser(user.id);
    if (rows.length === 0) {
      await ctx.reply("You haven't submitted any jobs yet. Use /postjob.");
      return;
    }
    const lines = rows.slice(0, 10).map(({ job }) => {
      const status = statusLabel(job.status);
      const salary = formatSalary(
        job.salaryMin,
        job.salaryMax,
        job.salaryCurrency,
      );
      return `• <b>${escapeHtml(job.title)}</b> – ${status} – ${escapeHtml(salary)}`;
    });
    await ctx.reply(lines.join("\n"), { parse_mode: "HTML" });
  });

  bot.on("callback_query", async (ctx) => {
    const data =
      "data" in ctx.callbackQuery ? ctx.callbackQuery.data : undefined;
    if (!data) return;
    if (data.startsWith("pickcat:")) {
      const categoryId = data.slice("pickcat:".length);
      await handleCategoryPick(ctx, categoryId);
      return;
    }
  });

  bot.on("message", async (ctx) => {
    // Ignore commands here — they're handled above.
    const msg = ctx.message;
    if (msg && "text" in msg && msg.text?.startsWith("/")) return;
    await handleWizardMessage(ctx);
  });

  bot.catch((err) => {
    console.error("[telegram] bot error:", err);
  });
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
