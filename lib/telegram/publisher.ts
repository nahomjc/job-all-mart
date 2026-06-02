import "server-only";
import {
	canUseTelegramInlineUrl,
	deliverAdminNotification,
} from "@/lib/telegram/admin-notify";
import { env } from "@/lib/env";
import { formatSalary, statusLabel } from "@/lib/format";
import { telegramClient } from "@/lib/telegram/client";
import type { Category, Job, User } from "@/server/db/schema";
import { telegramPostRepo } from "@/server/repositories/telegramPost";
import { jobRepo } from "@/server/repositories/job";
import { paymentRepo } from "@/server/repositories/payment";

/**
 * Build the public Telegram message body for a job.
 * Uses HTML parse mode for safer escaping than Markdown.
 */
export function formatJobMessage(args: {
  job: Job;
  category: Category | null;
  employer: User | null;
}): string {
  const { job, category, employer } = args;
  const url = `${env.NEXT_PUBLIC_APP_URL}/jobs/${job.slug}`;
  const employmentLabel = statusLabel(job.employmentType);

  const lines = [
    "🚀 <b>New Job Opportunity</b>",
    "",
    `🏢 <b>Company:</b> ${escapeHtml(job.company)}`,
    `💼 <b>Position:</b> ${escapeHtml(job.title)}`,
    `📍 <b>Location:</b> ${escapeHtml(job.location)} · ${escapeHtml(employmentLabel)}`,
    `💰 <b>Salary:</b> ${escapeHtml(
      formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency),
    )}`,
  ];

  if (category) lines.push(`🏷️ <b>Category:</b> ${escapeHtml(category.name)}`);

  lines.push("", "📝 <b>Description:</b>");
  lines.push(escapeHtml(truncateForTelegram(job.description, 800)));

  if (job.applyUrl) {
    const applyUrl = job.applyUrl.trim();
    if (canUseTelegramInlineUrl(applyUrl)) {
      lines.push("", "👉 Use the <b>Apply now</b> button below to apply.");
    } else {
      lines.push("", `👉 <b>Apply:</b> ${escapeHtml(applyUrl)}`);
    }
  } else if (job.contactInfo) {
    lines.push("", `📨 <b>Contact:</b> ${escapeHtml(job.contactInfo)}`);
  }

  lines.push("", `🔗 ${escapeHtml(url)}`);

  if (employer?.telegramUsername) {
    lines.push(`👤 Posted by @${escapeHtml(employer.telegramUsername)}`);
  }

  return lines.join("\n");
}

export async function publishJobToTelegram(jobId: string): Promise<{
  chatId: string;
  messageId: number;
  topicId: number | null;
}> {
  const data = await jobRepo.byIdWithRelations(jobId);
  if (!data?.job) throw new Error(`Job ${jobId} not found`);
  const { job, category, employer } = data;

  if (job.status !== "approved" && job.status !== "scheduled") {
    throw new Error(
      `Refusing to publish job ${jobId} in status ${job.status}`,
    );
  }

  const topicId = category?.telegramTopicId ?? null;
  const chatId = env.TELEGRAM_CHANNEL_ID;
  const text = formatJobMessage({ job, category, employer });
  const replyMarkup = buildJobPostReplyMarkup(job);

  let message: { message_id: number };
  try {
    message = job.logoUrl
      ? await telegramClient.sendPhoto(chatId, job.logoUrl, {
          caption: text,
          parse_mode: "HTML",
          ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
          ...(topicId ? { message_thread_id: topicId } : {}),
        })
      : await telegramClient.sendMessage(chatId, text, {
          parse_mode: "HTML",
          link_preview_options: { is_disabled: false },
          ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
          ...(topicId ? { message_thread_id: topicId } : {}),
        });
  } catch (err) {
    throw new Error(describePublishError(err, chatId, topicId));
  }

  const numericChatId = String(chatId);
  await telegramPostRepo.create({
    jobId: job.id,
    chatId: numericChatId,
    messageId: message.message_id,
    topicId: topicId ?? null,
    messageUrl: buildMessageUrl(chatId, message.message_id),
    clickCount: 0,
  });

  await jobRepo.update(job.id, {
    status: "posted",
    postedAt: new Date(),
    expiresAt:
      job.expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { chatId: numericChatId, messageId: message.message_id, topicId };
}

export async function notifyAdmins(text: string): Promise<void> {
  await deliverAdminNotification(async (chatId) => {
    await telegramClient.sendMessage(chatId, text, { parse_mode: "HTML" });
  });
}

/**
 * Notifies admins of a new job submission with summary text, payment screenshot,
 * and company logo (when available).
 */
export async function notifyAdminsNewSubmission(jobId: string): Promise<void> {
  const data = await jobRepo.byIdWithRelations(jobId);
  if (!data?.job) {
    console.warn("[telegram] notifyAdminsNewSubmission: job not found", jobId);
    return;
  }

  const payment = await paymentRepo.byJobId(jobId);
  const { job, category, employer } = data;
  const adminPath = `/admin/jobs/${jobId}`;
  const adminUrl = `${env.NEXT_PUBLIC_APP_URL}${adminPath}`;
  const loginRedirectUrl = `${env.NEXT_PUBLIC_APP_URL}/login?next=${encodeURIComponent(adminPath)}`;

  const employerLabel = employer?.telegramUsername
    ? `@${employer.telegramUsername}`
    : (employer?.displayName ?? employer?.email ?? "Unknown");

  const sourceLabel = job.source === "telegram" ? "Telegram bot" : "Website";

  const lines = [
    "🆕 <b>New submission awaiting review</b>",
    "",
    `💼 <b>${escapeHtml(job.title)}</b>`,
    `🏢 ${escapeHtml(job.company)}`,
    `📍 ${escapeHtml(job.location)}`,
    category ? `🏷️ ${escapeHtml(category.name)}` : "",
    payment
      ? `💵 ${payment.amount} ${payment.currency} · ${escapeHtml(statusLabel(payment.status))}`
      : "",
    `👤 ${escapeHtml(employerLabel)}`,
    `📨 Source: ${sourceLabel}`,
  ];

  const screenshotUrl = payment?.screenshotUrl?.trim() ?? "";
  const logoUrl = job.logoUrl?.trim() ?? "";
  const previewImageUrl = isImageUrl(screenshotUrl)
    ? screenshotUrl
    : isImageUrl(logoUrl)
      ? logoUrl
      : "";

  if (!isImageUrl(screenshotUrl)) {
    lines.push("", "📸 <i>No payment screenshot attached</i>");
  }

  if (canUseTelegramInlineUrl(loginRedirectUrl)) {
    lines.push(
      "",
      `<a href="${escapeHtml(loginRedirectUrl)}">Review in admin panel (login required)</a>`,
    );
  } else {
    lines.push(
      "",
      "🔗 Admin panel:",
      escapeHtml(loginRedirectUrl),
      "",
      "<i>Set NEXT_PUBLIC_APP_URL to your public HTTPS domain for clickable review links.</i>",
    );
  }

  const replyMarkup = canUseTelegramInlineUrl(loginRedirectUrl)
    ? {
        inline_keyboard: [
          [
            { text: "Review in Telegram", web_app: { url: loginRedirectUrl } },
            { text: "Review in browser", url: loginRedirectUrl },
          ],
        ],
      }
    : undefined;

  const text = lines.filter(Boolean).join("\n");

  await deliverAdminNotification(async (chatId) => {
    if (previewImageUrl) {
      await telegramClient.sendPhoto(chatId, previewImageUrl, {
        caption: text,
        parse_mode: "HTML",
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      });
      return;
    }

    await telegramClient.sendMessage(chatId, text, {
      parse_mode: "HTML",
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      link_preview_options: { is_disabled: true },
    });
  });
}

/** Inline keyboard for channel job posts when an apply URL is set. */
export function buildJobPostReplyMarkup(job: Job):
  | { inline_keyboard: { text: string; url: string }[][] }
  | undefined {
  const applyUrl = job.applyUrl?.trim();
  if (!applyUrl || !canUseTelegramInlineUrl(applyUrl)) return undefined;

  return {
    inline_keyboard: [[{ text: "Apply now", url: applyUrl }]],
  };
}

function isImageUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

function truncateForTelegram(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildMessageUrl(chatId: string | number, messageId: number): string {
  // Private supergroup IDs start with -100. To build https://t.me/c/<id>/<msg>
  // we strip the -100 prefix.
  const idStr = String(chatId);
  if (idStr.startsWith("-100")) {
    return `https://t.me/c/${idStr.slice(4)}/${messageId}`;
  }
  return "";
}

function describePublishError(
  err: unknown,
  chatId: string,
  topicId: number | null,
): string {
  const raw = err instanceof Error ? err.message : String(err);
  const msg = raw.toLowerCase();

  if (msg.includes("chat not found")) {
    return [
      `Telegram chat not found for TELEGRAM_CHANNEL_ID='${chatId}'.`,
      "Fix: run /chatid inside your target Telegram supergroup and copy that exact id into TELEGRAM_CHANNEL_ID.",
      "Also ensure the bot is added to that chat (preferably admin), then restart the app.",
    ].join(" ");
  }

  if (msg.includes("not enough rights")) {
    return [
      "Telegram bot lacks permissions to post in the configured channel/group.",
      "Fix: make the bot an admin in that chat with permission to send messages/media.",
    ].join(" ");
  }

  if (msg.includes("message thread not found")) {
    return [
      `Telegram topic (thread) not found for topicId=${topicId ?? "null"}.`,
      "Fix: open the forum topic in Telegram, run /topicid there, and update the category topic id.",
    ].join(" ");
  }

  return raw;
}
