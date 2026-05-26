import "server-only";
import { env } from "@/lib/env";
import { formatSalary, statusLabel } from "@/lib/format";
import { telegramClient } from "@/lib/telegram/client";
import type { Category, Job, User } from "@/server/db/schema";
import { telegramPostRepo } from "@/server/repositories/telegramPost";
import { jobRepo } from "@/server/repositories/job";

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
    lines.push("", `👉 <b>Apply:</b> ${escapeHtml(job.applyUrl)}`);
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

  const message = job.logoUrl
    ? await telegramClient.sendPhoto(chatId, job.logoUrl, {
        caption: text,
        parse_mode: "HTML",
        ...(topicId ? { message_thread_id: topicId } : {}),
      })
    : await telegramClient.sendMessage(chatId, text, {
        parse_mode: "HTML",
        link_preview_options: { is_disabled: false },
        ...(topicId ? { message_thread_id: topicId } : {}),
      });

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
  const chatId = env.TELEGRAM_ADMIN_NOTIFY_CHAT_ID;
  if (!chatId) return;
  try {
    await telegramClient.sendMessage(chatId, text, { parse_mode: "HTML" });
  } catch (err) {
    console.warn("[telegram] notifyAdmins failed:", err);
  }
}

function truncateForTelegram(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + "...";
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
