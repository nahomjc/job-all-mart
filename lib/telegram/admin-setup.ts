import "server-only";
import type { Context } from "telegraf";
import { env } from "@/lib/env";

/**
 * Setup/discovery commands are open to everyone while `TELEGRAM_ADMIN_IDS` is
 * empty (first-time bootstrap). Once at least one admin id is configured in
 * `.env`, only those users may run `/chatid`, `/topicid`, and `/setupids`.
 * `/myid` stays public so new admins can learn their id before being added.
 */
export function isSetupAdmin(telegramUserId: number): boolean {
  const admins = env.TELEGRAM_ADMIN_IDS;
  if (admins.length === 0) return true;
  return admins.includes(telegramUserId);
}

function chatTypeLabel(type: string | undefined): string {
  switch (type) {
    case "private":
      return "private (DM)";
    case "group":
      return "group";
    case "supergroup":
      return "supergroup (use for TELEGRAM_CHANNEL_ID)";
    case "channel":
      return "channel";
    default:
      return type ?? "unknown";
  }
}

function envLine(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    return `<code>${name}=</code> <i>(not set)</i>`;
  }
  return `<code>${name}=${escapeHtml(value)}</code>`;
}

export async function handleMyId(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) {
    await ctx.reply("Could not read your Telegram user.");
    return;
  }

  const username = from.username ? `@${from.username}` : "(no username)";

  await ctx.reply(
    [
      "🆔 <b>Your Telegram user ID</b>",
      "",
      `<code>${from.id}</code>`,
      `Name: ${escapeHtml(from.first_name)}${from.last_name ? ` ${escapeHtml(from.last_name)}` : ""}`,
      `Username: ${escapeHtml(username)}`,
      "",
      "Add to <code>.env</code>:",
      `<code>TELEGRAM_ADMIN_IDS=${from.id}</code>`,
      "",
      "<i>Comma-separate multiple admins:</i>",
      "<code>TELEGRAM_ADMIN_IDS=111,222,333</code>",
    ].join("\n"),
    { parse_mode: "HTML" },
  );
}

export async function handleChatId(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  if (!isSetupAdmin(from.id)) {
    await ctx.reply("⛔ Setup commands are restricted to configured admins.");
    return;
  }

  const chat = ctx.chat;
  if (!chat) {
    await ctx.reply("No chat context.");
    return;
  }

  const chatId = chat.id;
  const type = chatTypeLabel(chat.type);
  const title =
    "title" in chat && chat.title ? escapeHtml(chat.title) : "(no title)";

  const hints: string[] = [];
  if (chat.type === "supergroup") {
    hints.push(
      "→ <code>TELEGRAM_CHANNEL_ID</code> (job posting supergroup with forum topics)",
    );
  } else if (chat.type === "private") {
    hints.push(
      "→ <code>TELEGRAM_ADMIN_NOTIFY_CHAT_ID</code> (your personal DM for admin alerts)",
    );
  } else if (chat.type === "group" || chat.type === "channel") {
    hints.push(
      "→ <code>TELEGRAM_CHANNEL_ID</code> or <code>TELEGRAM_ADMIN_NOTIFY_CHAT_ID</code>",
    );
  }

  await ctx.reply(
    [
      "💬 <b>Current chat ID</b>",
      "",
      `<code>${chatId}</code>`,
      `Type: ${type}`,
      `Title: ${title}`,
      "",
      ...hints,
      "",
      envLine("TELEGRAM_CHANNEL_ID (configured)", env.TELEGRAM_CHANNEL_ID),
      envLine(
        "TELEGRAM_ADMIN_NOTIFY_CHAT_ID (configured)",
        env.TELEGRAM_ADMIN_NOTIFY_CHAT_ID,
      ),
      "",
      "<i>Tip: forward any message from your jobs supergroup to this bot, or add the bot to that group and run /chatid there.</i>",
    ].join("\n"),
    { parse_mode: "HTML" },
  );
}

export async function handleTopicId(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  if (!isSetupAdmin(from.id)) {
    await ctx.reply("⛔ Setup commands are restricted to configured admins.");
    return;
  }

  const msg = ctx.message;
  const threadId =
    msg && "message_thread_id" in msg ? msg.message_thread_id : undefined;

  if (!threadId) {
    await ctx.reply(
      [
        "📌 <b>Forum topic ID</b>",
        "",
        "No topic detected. Run this command <b>inside a forum topic</b> in your supergroup (not in General / main chat).",
        "",
        "Or copy from a topic link:",
        "<code>https://t.me/c/1234567890/42</code> → topic id is <code>42</code>",
        "",
        "Paste that number in <b>Admin → Categories → Telegram topic ID</b>.",
      ].join("\n"),
      { parse_mode: "HTML" },
    );
    return;
  }

  const chatId = ctx.chat?.id;

  await ctx.reply(
    [
      "📌 <b>Forum topic ID</b>",
      "",
      `<code>${threadId}</code>`,
      chatId ? `Chat: <code>${chatId}</code>` : "",
      "",
      "Use in <b>Admin → Categories → Telegram topic ID</b> for this category.",
      "",
      envLine("TELEGRAM_CHANNEL_ID (configured)", env.TELEGRAM_CHANNEL_ID),
    ].join("\n"),
    { parse_mode: "HTML" },
  );
}

export async function handleSetupIds(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  if (!isSetupAdmin(from.id)) {
    await ctx.reply("⛔ Setup commands are restricted to configured admins.");
    return;
  }

  const chat = ctx.chat;
  const msg = ctx.message;
  const threadId =
    msg && "message_thread_id" in msg ? msg.message_thread_id : undefined;

  const admins = env.TELEGRAM_ADMIN_IDS;
  const adminList =
    admins.length > 0
      ? admins.map((id) => `<code>${id}</code>`).join(", ")
      : "<i>(none — all setup commands allowed until you set TELEGRAM_ADMIN_IDS)</i>";

  const suggestedEnv = [
    "# Paste into .env",
    `TELEGRAM_ADMIN_IDS=${from.id}`,
    chat?.type === "supergroup"
      ? `TELEGRAM_CHANNEL_ID=${chat.id}`
      : "# TELEGRAM_CHANNEL_ID=  ← run /chatid inside your jobs supergroup",
    chat?.type === "private"
      ? `TELEGRAM_ADMIN_NOTIFY_CHAT_ID=${chat.id}`
      : "# TELEGRAM_ADMIN_NOTIFY_CHAT_ID=  ← run /chatid in DM or admin group",
    threadId
      ? `# Category topic id (admin UI): ${threadId}`
      : "# Category topic id: run /topicid inside each forum topic",
  ].join("\n");

  await ctx.reply(
    [
      "⚙️ <b>Telegram setup IDs</b>",
      "",
      "<b>You (caller)</b>",
      `User id: <code>${from.id}</code>`,
      from.username ? `Username: @${escapeHtml(from.username)}` : "",
      "",
      "<b>This chat</b>",
      chat
        ? `Chat id: <code>${chat.id}</code> (${chatTypeLabel(chat.type)})`
        : "—",
      threadId
        ? `Topic id: <code>${threadId}</code>`
        : "Topic id: <i>not in a topic — use /topicid inside a forum topic</i>",
      "",
      "<b>Configured in .env</b>",
      envLine("TELEGRAM_CHANNEL_ID", env.TELEGRAM_CHANNEL_ID),
      envLine("TELEGRAM_REQUIRED_CHANNEL", env.TELEGRAM_REQUIRED_CHANNEL),
      envLine(
        "TELEGRAM_ADMIN_NOTIFY_CHAT_ID",
        env.TELEGRAM_ADMIN_NOTIFY_CHAT_ID,
      ),
      `TELEGRAM_ADMIN_IDS: ${adminList}`,
      "",
      "<b>Suggested .env lines</b>",
      `<pre>${escapeHtml(suggestedEnv)}</pre>`,
      "",
      "Commands: /myid · /chatid · /topicid · /setupids",
    ].join("\n"),
    { parse_mode: "HTML" },
  );
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
