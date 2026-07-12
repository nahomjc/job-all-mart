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
import { settingsRepo } from "@/server/repositories/settings";

type InlineButton =
	| { text: string; url: string }
	| { text: string; callback_data: string };

type JobPostReplyMarkup =
	| { inline_keyboard: InlineButton[][] }
	| undefined;

async function sendJobToTelegramChat(args: {
	chatId: string;
	text: string;
	replyMarkup: JobPostReplyMarkup;
	logoUrl: string | null;
	topicId?: number | null;
}): Promise<{ message_id: number }> {
	const { chatId, text, replyMarkup, logoUrl, topicId } = args;
	const threadOpts = topicId ? { message_thread_id: topicId } : {};

	if (logoUrl) {
		return telegramClient.sendPhoto(chatId, logoUrl, {
			caption: text,
			parse_mode: "HTML",
			...(replyMarkup ? { reply_markup: replyMarkup } : {}),
			...threadOpts,
		});
	}

	return telegramClient.sendMessage(chatId, text, {
		parse_mode: "HTML",
		link_preview_options: { is_disabled: false },
		...(replyMarkup ? { reply_markup: replyMarkup } : {}),
		...threadOpts,
	});
}

async function recordTelegramPost(args: {
	jobId: string;
	chatId: string | number;
	messageId: number;
	topicId: number | null;
}): Promise<void> {
	const numericChatId = String(args.chatId);
	await telegramPostRepo.create({
		jobId: args.jobId,
		chatId: numericChatId,
		messageId: args.messageId,
		topicId: args.topicId,
		messageUrl: buildMessageUrl(args.chatId, args.messageId),
		clickCount: 0,
	});
}

const TELEGRAM_CAPTION_LIMIT = 1024;
const TELEGRAM_MESSAGE_LIMIT = 4096;

/**
 * Build the public Telegram message body for a job.
 * Uses HTML parse mode for safer escaping than Markdown.
 *
 * `maxLength` must reflect the send mode: photo captions are capped at 1024
 * characters while plain messages allow up to 4096. The job description is
 * trimmed to whatever budget remains so we never blow past the limit.
 */
export function formatJobMessage(args: {
  job: Job;
  category: Category | null;
  employer: User | null;
  maxLength?: number;
}): string {
  const { job, category, employer, maxLength = TELEGRAM_MESSAGE_LIMIT } = args;
  const url = `${env.NEXT_PUBLIC_APP_URL}/jobs/${job.slug}`;
  const employmentLabel = statusLabel(job.employmentType);

  const header = [
    "🚀 <b>New Job Opportunity</b>",
    "",
    `🏢 <b>Company:</b> ${escapeHtml(job.company)}`,
    `💼 <b>Position:</b> ${escapeHtml(job.title)}`,
    `📍 <b>Location:</b> ${escapeHtml(job.location)} · ${escapeHtml(employmentLabel)}`,
    `💰 <b>Salary:</b> ${escapeHtml(
      formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency),
    )}`,
  ];

  if (category) header.push(`🏷️ <b>Category:</b> ${escapeHtml(category.name)}`);

  const footer: string[] = [];
  if (job.applyUrl) {
    const applyUrl = job.applyUrl.trim();
    if (canUseTelegramInlineUrl(applyUrl)) {
      footer.push("", "👉 Use the <b>Apply now</b> button below to apply.");
    } else {
      footer.push("", `👉 <b>Apply:</b> ${escapeHtml(applyUrl)}`);
    }
  } else if (job.contactInfo) {
    footer.push("", `📨 <b>Contact:</b> ${escapeHtml(job.contactInfo)}`);
  }

  footer.push("", `🔗 ${escapeHtml(url)}`);

  if (employer?.telegramUsername) {
    footer.push(`👤 Posted by @${escapeHtml(employer.telegramUsername)}`);
  }

  // Everything except the description body is fixed overhead. Give the rest of
  // the budget to the description so the caption/message fits. We trim the raw
  // text (not the escaped form) so we never split an HTML entity like &amp;.
  const descriptionLabel = ["", "📝 <b>Description:</b>"];
  const fixedParts = [...header, ...descriptionLabel, "", ...footer];
  const fixedLength = fixedParts.join("\n").length;
  // Escaping can expand the description, so budget on raw length with a safety
  // margin to keep the escaped result under maxLength.
  const rawBudget = Math.max(0, Math.floor((maxLength - fixedLength - 8) / 1.2));

  const rawDescription = job.description;
  const descriptionBody = escapeHtml(
    rawDescription.length > rawBudget
      ? `${rawDescription.slice(0, Math.max(0, rawBudget - 1)).trimEnd()}…`
      : rawDescription,
  );

  return [...header, ...descriptionLabel, descriptionBody, ...footer].join("\n");
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
  const text = formatJobMessage({
    job,
    category,
    employer,
    maxLength: job.logoUrl ? TELEGRAM_CAPTION_LIMIT : TELEGRAM_MESSAGE_LIMIT,
  });
  const replyMarkup = buildJobPostReplyMarkup(job, await getFooterLinkRows());

  let message: { message_id: number };
  try {
    message = await sendJobToTelegramChat({
      chatId,
      text,
      replyMarkup,
      logoUrl: job.logoUrl,
      topicId,
    });
  } catch (err) {
    throw new Error(describePublishError(err, chatId, topicId));
  }

  await recordTelegramPost({
    jobId: job.id,
    chatId,
    messageId: message.message_id,
    topicId: topicId ?? null,
  });

  await jobRepo.update(job.id, {
    status: "posted",
    postedAt: new Date(),
    expiresAt:
      job.expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  await publishToBroadcastChannel({
    job,
    text,
    replyMarkup,
    groupChatId: String(chatId),
  });

  return {
    chatId: String(chatId),
    messageId: message.message_id,
    topicId,
  };
}

async function publishToBroadcastChannel(args: {
  job: Job;
  text: string;
  replyMarkup: JobPostReplyMarkup;
  groupChatId: string;
}): Promise<void> {
  const broadcast = await settingsRepo.getTelegramBroadcast();
  if (!broadcast.enabled || !broadcast.channelId) return;
  if (broadcast.channelId === args.groupChatId) return;

  try {
    const channelMessage = await sendJobToTelegramChat({
      chatId: broadcast.channelId,
      text: args.text,
      replyMarkup: args.replyMarkup,
      logoUrl: args.job.logoUrl,
    });

    await recordTelegramPost({
      jobId: args.job.id,
      chatId: broadcast.channelId,
      messageId: channelMessage.message_id,
      topicId: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const adminLink = `${env.NEXT_PUBLIC_APP_URL}/admin/jobs/${args.job.id}`;
    await notifyAdmins(
      [
        "⚠️ Job posted to the forum group but broadcast channel failed",
        `Job: ${escapeHtml(args.job.title)}`,
        `Channel: ${escapeHtml(broadcast.channelId)}`,
        adminLink,
        `Error: ${escapeHtml(message)}`,
        "",
        "Check Admin → Settings: bot must be an admin of the channel with post permission.",
      ].join("\n"),
    );
    console.warn("[telegram] broadcast channel publish failed:", message);
  }
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

/**
 * Inline keyboard for channel job posts. Includes an "Apply now" button when
 * an apply URL is set, followed by any configured footer buttons
 * (TikTok/Facebook/etc.), each on its own row.
 */
export function buildJobPostReplyMarkup(
  job: Job,
  footerRows: InlineButton[][] = [],
): JobPostReplyMarkup {
  const rows: InlineButton[][] = [];

  const applyUrl = job.applyUrl?.trim();
  if (applyUrl && canUseTelegramInlineUrl(applyUrl)) {
    rows.push([{ text: "Apply now", url: applyUrl }]);
  }

  rows.push(...footerRows);

  return rows.length > 0 ? { inline_keyboard: rows } : undefined;
}

/**
 * Reads the admin-configured footer buttons as inline-keyboard rows. Entries
 * with a valid URL become link buttons; entries with only popup text become
 * callback buttons (handled by the bot to show a popup alert).
 */
export async function getFooterLinkRows(): Promise<InlineButton[][]> {
  const links = await settingsRepo.getFooterLinks();
  const rows: InlineButton[][] = [];
  links.forEach((link, i) => {
    const url = link.url.trim();
    if (url && canUseTelegramInlineUrl(url)) {
      rows.push([{ text: link.label, url }]);
    } else if (link.popup?.trim()) {
      rows.push([{ text: link.label, callback_data: `fp:${i}` }]);
    }
  });
  return rows;
}

function isImageUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
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
