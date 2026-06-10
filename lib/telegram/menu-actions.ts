import "server-only";
import type { Context } from "telegraf";
import { env } from "@/lib/env";
import {
  joinRequiredChannelKeyboard,
  mainMenuKeyboard,
  MAIN_MENU,
  removeMainMenuKeyboard,
} from "@/lib/telegram/keyboards";
import { getDraft, startDraft, ensureCanPost } from "@/lib/telegram/wizard";

export async function sendHelpMessage(ctx: Context): Promise<void> {
  const lines = [
    `❓ Help — ${env.NEXT_PUBLIC_APP_NAME}`,
    "",
    "Commands:",
    "• /postjob — guided job submission",
    "• /myjobs — your posts and status",
    "• /pricing — plans & fees",
    "• /cancel — cancel an in-progress submission",
    "",
    "Or use the menu buttons below the text box.",
  ];
  await ctx.reply(lines.join("\n"), mainMenuKeyboard());
}

export async function sendContactMessage(ctx: Context): Promise<void> {
  const site = env.NEXT_PUBLIC_APP_URL;
  await ctx.reply(
    `📞 Contact ${env.NEXT_PUBLIC_APP_NAME}\n\n` +
      `• Website: ${site}\n` +
      `• Post online: ${site}/login?mode=signup\n` +
      `• Pricing: ${site}/pricing\n\n` +
      "You can also reply here with your question — our team will follow up.",
    mainMenuKeyboard(),
  );
  await ctx.reply("Quick links:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🌐 Open website", url: site }],
        [{ text: "💎 View pricing", url: `${site}/pricing` }],
      ],
    },
  });
}

export async function runPostJobFlow(ctx: Context): Promise<void> {
  if (!ctx.from) return;

  const existing = getDraft(ctx.from.id);
  if (existing) {
    await ctx.reply(
      "You already have a submission in progress.\nFinish it or send /cancel to start over.",
      removeMainMenuKeyboard(),
    );
    return;
  }

  const check = await ensureCanPost(ctx);
  if (!check.ok) {
    const needsJoin = check.reason.includes("join") || check.reason.includes("Join");
    await ctx.reply(
      check.reason,
      needsJoin ? joinRequiredChannelKeyboard() : mainMenuKeyboard(),
    );
    if (needsJoin) {
      await ctx.reply("When you've joined, tap Post a job below.", mainMenuKeyboard());
    }
    return;
  }

  startDraft(ctx.from.id);
  await ctx.reply(
    "Let's create a job post. ✏️\n\nFirst — what's the job title?",
    removeMainMenuKeyboard(),
  );
}

export async function handleMainMenuButton(
  ctx: Context,
  text: string,
): Promise<void> {
  const label = text.trim();
  switch (label) {
    case MAIN_MENU.POST_JOB:
      await runPostJobFlow(ctx);
      break;
    case MAIN_MENU.HELP:
      await sendHelpMessage(ctx);
      break;
    case MAIN_MENU.CONTACT:
      await sendContactMessage(ctx);
      break;
    default:
      break;
  }
}
