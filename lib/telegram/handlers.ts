import "server-only";
import type { Telegraf } from "telegraf";
import { env } from "@/lib/env";
import { userRepo } from "@/server/repositories/user";
import { jobRepo } from "@/server/repositories/job";
import { settingsRepo } from "@/server/repositories/settings";
import {
  clearDraft,
  handleCategoryPick,
  handleSalarySkip,
  handleWizardMessage,
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
import {
  isMainMenuButton,
  joinRequiredChannelKeyboard,
  mainMenuKeyboard,
} from "@/lib/telegram/keyboards";
import {
  handleMainMenuButton,
  runPostJobFlow,
  sendHelpMessage,
} from "@/lib/telegram/menu-actions";
import { requiredChannelLabel } from "@/lib/telegram/required-channel";
import { createBotLoginToken } from "@/lib/telegram/bot-login-token";
import { telegramWebLoginRepo } from "@/server/repositories/telegramWebLogin";
import { getTelebirrAccount } from "@/lib/payment-accounts";

let registered = false;

function uuidFromCompact(compact: string): string | null {
  const hex = compact.replace(/-/g, "").toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) return null;
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function parseWebLoginSessionId(payload: string): string | null {
  if (!payload.startsWith("wl_")) return null;
  return uuidFromCompact(payload.slice(3));
}

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

    // Account linking: attach this Telegram to an existing website account.
    // Handled before the upsert below so we don't create a separate row.
    if (startPayload.startsWith("link_")) {
      const code = startPayload.slice("link_".length);
      const target = code ? await userRepo.byTelegramLinkCode(code) : null;
      if (
        !target ||
        !target.telegramLinkExpiresAt ||
        target.telegramLinkExpiresAt.getTime() < Date.now()
      ) {
        await ctx.reply(
          "This connection link is invalid or has expired. Open Settings on the website and tap Connect Telegram again.",
        );
        return;
      }

      const linked = await userRepo.attachTelegram(target.id, {
        telegramId: from.id,
        username: from.username,
        firstName: from.first_name,
        lastName: from.last_name,
      });
      if (!linked) {
        await ctx.reply(
          "This Telegram account is already connected to a different account. Please use another Telegram account or contact support.",
        );
        return;
      }

      await ctx.reply(
        `✅ Your Telegram is now connected to ${env.NEXT_PUBLIC_APP_NAME}!\n\nYou'll receive submission and approval updates here, and you can post jobs straight from this chat.`,
        mainMenuKeyboard(),
      );
      return;
    }

    await userRepo.upsertFromTelegram({
      telegramId: from.id,
      username: from.username,
      firstName: from.first_name,
      lastName: from.last_name,
    });

    const webLoginSessionId = parseWebLoginSessionId(startPayload);
    if (webLoginSessionId) {
      const session = await telegramWebLoginRepo.byId(webLoginSessionId);
      if (
        !session ||
        session.status !== "pending" ||
        session.expiresAt.getTime() < Date.now()
      ) {
        await ctx.reply(
          "This website login link expired or was already used.\nGo back to the website and tap Continue with Telegram again.",
          mainMenuKeyboard(),
        );
        return;
      }

      await ctx.reply(
        `Sign in to ${env.NEXT_PUBLIC_APP_NAME} on the website?\n\n` +
          "Confirm here — your browser tab will finish login automatically (no need to open a link).",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Confirm website login",
                  callback_data: `wl:ok:${webLoginSessionId.replace(/-/g, "")}`,
                },
              ],
              [
                {
                  text: "Cancel",
                  callback_data: `wl:no:${webLoginSessionId.replace(/-/g, "")}`,
                },
              ],
            ],
          },
        },
      );
      return;
    }

    if (startPayload === "weblogin") {
      const token = createBotLoginToken(from.id);
      const confirmUrl = `${env.NEXT_PUBLIC_APP_URL}/api/auth/telegram/bot-confirm?token=${encodeURIComponent(token)}&next=/post/new`;
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

Before posting, join ${requiredChannelLabel()} using the button below.

Then use the menu under the text box — Post a job, Help, or Contact.`,
      joinRequiredChannelKeyboard(),
    );
    await ctx.reply("👇 Quick actions", mainMenuKeyboard());
  });

  bot.help(async (ctx) => {
    await sendHelpMessage(ctx);
    if (ctx.from && isSetupAdmin(ctx.from.id)) {
      await ctx.reply(
        [
          "Setup (admin):",
          "/chatid – chat id for channel / notify",
          "/topicid – forum topic id (run inside a topic)",
          "/setupids – all ids + suggested .env block",
          "/testnotify – send a test admin alert",
          "/myid – your Telegram user id",
        ].join("\n"),
        mainMenuKeyboard(),
      );
    }
  });

  bot.command("myid", handleMyId);
  bot.command("chatid", handleChatId);
  bot.command("topicid", handleTopicId);
  bot.command("setupids", handleSetupIds);
  bot.command("testnotify", handleTestNotify);

  bot.command("pricing", async (ctx) => {
    const telebirr = getTelebirrAccount();
    await ctx.reply(
      `💎 Pricing

• Free: 1 post / 30 days
• Basic (ETB 500/post): goes live in <2h after admin approval
• Pro (ETB 1,250/post): featured + pinned for 24h
• Enterprise: contact admin

💵 Pay via Telebirr to: ${telebirr}

Full details: ${env.NEXT_PUBLIC_APP_URL}/pricing`,
      mainMenuKeyboard(),
    );
  });

  bot.command("cancel", async (ctx) => {
    if (!ctx.from) return;
    clearDraft(ctx.from.id);
    await ctx.reply(
      "Cancelled. Tap Post a job below to start again.",
      mainMenuKeyboard(),
    );
  });

  bot.command("postjob", async (ctx) => {
    await runPostJobFlow(ctx);
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
      await ctx.reply(
        "You haven't submitted any jobs yet. Tap Post a job below.",
        mainMenuKeyboard(),
      );
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
    await ctx.reply(lines.join("\n"), {
      parse_mode: "HTML",
      ...mainMenuKeyboard(),
    });
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
    if (data === "skip:salary") {
      await handleSalarySkip(ctx);
      return;
    }
    if (data.startsWith("wl:ok:") || data.startsWith("wl:no:")) {
      const from = ctx.from;
      if (!from) return;
      const approve = data.startsWith("wl:ok:");
      const sessionId = uuidFromCompact(data.slice(6));
      if (!sessionId) {
        await ctx.answerCbQuery("Invalid login session");
        return;
      }

      if (!approve) {
        await telegramWebLoginRepo.cancel(sessionId);
        await ctx.answerCbQuery("Cancelled");
        await ctx.editMessageText(
          "Website login cancelled. You can close this chat and stay on the website.",
        );
        return;
      }

      const approved = await telegramWebLoginRepo.approve(sessionId, from.id);
      if (!approved) {
        await ctx.answerCbQuery("Login expired or already used");
        await ctx.editMessageText(
          "This website login expired or was already used. Start again from the website.",
        );
        return;
      }

      await userRepo.upsertFromTelegram({
        telegramId: from.id,
        username: from.username,
        firstName: from.first_name,
        lastName: from.last_name,
      });

      await ctx.answerCbQuery("Confirmed");
      await ctx.editMessageText(
        `✅ Confirmed!\n\nReturn to your browser tab — ${env.NEXT_PUBLIC_APP_NAME} will finish signing you in there automatically.`,
      );
      return;
    }
    // Footer button popup (e.g. "MAK Adverts services") on posted jobs.
    if (data.startsWith("fp:")) {
      const index = Number(data.slice("fp:".length));
      const links = await settingsRepo.getFooterLinks();
      const popup = Number.isFinite(index) ? links[index]?.popup : undefined;
      await ctx.answerCbQuery(popup?.slice(0, 200) ?? "", {
        show_alert: true,
      });
      return;
    }
  });

  bot.on("message", async (ctx) => {
    const msg = ctx.message;
    if (msg && "text" in msg && msg.text?.startsWith("/")) return;

    const text =
      msg && "text" in msg ? (msg.text?.trim() ?? "") : "";

    if (text && isMainMenuButton(text)) {
      await handleMainMenuButton(ctx, text);
      return;
    }

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
