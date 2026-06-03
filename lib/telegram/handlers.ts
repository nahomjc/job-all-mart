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
import {
  handleChatId,
  handleMyId,
  handleSetupIds,
  handleTestNotify,
  handleTopicId,
  isSetupAdmin,
} from "@/lib/telegram/admin-setup";
import { formatSalary, statusLabel } from "@/lib/format";
import { joinRequiredChannelKeyboard } from "@/lib/telegram/keyboards";
import { requiredChannelLabel } from "@/lib/telegram/required-channel";
import { createBotLoginToken } from "@/lib/telegram/bot-login-token";

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

    const startPayload = (ctx.payload ?? ctx.startPayload ?? "").trim();

    await userRepo.upsertFromTelegram({
      telegramId: from.id,
      username: from.username,
      firstName: from.first_name,
      lastName: from.last_name,
    });

    if (startPayload === "weblogin") {
      const token = createBotLoginToken(from.id);
      const confirmUrl = `${env.NEXT_PUBLIC_APP_URL}/api/auth/telegram/bot-confirm?token=${encodeURIComponent(token)}&next=/dashboard`;
      await ctx.reply(
        `Sign in to ${env.NEXT_PUBLIC_APP_NAME} on the website.\n\nTap the button below to finish login (link expires in 10 minutes).`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "✅ Confirm website login", url: confirmUrl }],
            ],
          },
        },
      );
      return;
    }

    await ctx.reply(
      `Welcome to ${env.NEXT_PUBLIC_APP_NAME}! 👋

I help you post jobs to our Telegram channels.

Available commands:
• /postjob – submit a new job
• /myjobs – view your submissions
• /pricing – view our plans
• /help – show this message

Before posting, join ${requiredChannelLabel()} using the button below.`,
      joinRequiredChannelKeyboard(),
    );
  });

  bot.help(async (ctx) => {
    const lines = [
      "Commands:",
      "/postjob – guided job submission",
      "/myjobs – list your posts and their status",
      "/pricing – view our plans",
      "/cancel – cancel an in-progress submission",
      "/myid – your Telegram user id (for .env setup)",
    ];
    if (ctx.from && isSetupAdmin(ctx.from.id)) {
      lines.push(
        "",
        "Setup (admin):",
        "/chatid – chat id for channel / notify",
        "/topicid – forum topic id (run inside a topic)",
        "/setupids – all ids + suggested .env block",
        "/testnotify – send a test admin alert",
      );
    }
    await ctx.reply(lines.join("\n"));
  });

  bot.command("myid", handleMyId);
  bot.command("chatid", handleChatId);
  bot.command("topicid", handleTopicId);
  bot.command("setupids", handleSetupIds);
  bot.command("testnotify", handleTestNotify);

  bot.command("pricing", async (ctx) => {
    await ctx.reply(
      `💎 Pricing

• Free: 1 post / 30 days
• Basic ($10/post): goes live in <2h after admin approval
• Pro ($25/post): featured + pinned for 24h
• Enterprise: contact admin

Full details: ${env.NEXT_PUBLIC_APP_URL}/pricing`,
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
      await ctx.reply(check.reason, joinRequiredChannelKeyboard());
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
