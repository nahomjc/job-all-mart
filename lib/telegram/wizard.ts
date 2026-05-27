import "server-only";
import type { Context } from "telegraf";
import { telegramClient } from "@/lib/telegram/client";
import { uploadBufferToR2 } from "@/lib/telegram/upload";
import { env } from "@/lib/env";
import { categoryRepo } from "@/server/repositories/category";
import { jobRepo } from "@/server/repositories/job";
import { paymentRepo } from "@/server/repositories/payment";
import { userRepo } from "@/server/repositories/user";
import { auditLogRepo } from "@/server/repositories/auditLog";
import { detectSpam } from "@/lib/spam";
import { rateLimit } from "@/lib/rate-limit";
import { slugify } from "@/lib/format";
import { isUserInRequiredChannel } from "@/lib/telegram/client";
import { notifyAdmins } from "@/lib/telegram/publisher";

/**
 * In-memory wizard state. For a single-instance deployment this is fine; for
 * multi-instance, move to Redis with the same shape.
 */
type WizardStep =
  | "idle"
  | "awaiting_title"
  | "awaiting_company"
  | "awaiting_description"
  | "awaiting_category"
  | "awaiting_location"
  | "awaiting_salary"
  | "awaiting_apply_url"
  | "awaiting_payment_amount"
  | "awaiting_payment_screenshot";

interface Draft {
  step: WizardStep;
  title?: string;
  company?: string;
  description?: string;
  categoryId?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  applyUrl?: string;
  paymentAmount?: number;
  jobId?: string;
  startedAt: number;
}

const DRAFTS = new Map<number, Draft>(); // keyed by Telegram user id
const SESSION_TTL_MS = 1000 * 60 * 30;

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of DRAFTS) {
    if (now - v.startedAt > SESSION_TTL_MS) DRAFTS.delete(k);
  }
}, 5 * 60_000).unref?.();

export function startDraft(telegramUserId: number) {
  DRAFTS.set(telegramUserId, {
    step: "awaiting_title",
    startedAt: Date.now(),
  });
}

export function getDraft(telegramUserId: number): Draft | undefined {
  return DRAFTS.get(telegramUserId);
}

export function clearDraft(telegramUserId: number) {
  DRAFTS.delete(telegramUserId);
}

/**
 * Wizard router: feed a Telegram message into the active draft. Returns true
 * if the message was consumed.
 */
export async function handleWizardMessage(ctx: Context): Promise<boolean> {
  const from = ctx.from;
  if (!from) return false;
  const draft = DRAFTS.get(from.id);
  if (!draft) return false;

  const user = await userRepo.byTelegramId(from.id);
  if (!user) return false;

  // Document → only handled in screenshot step
  const text = (ctx.message && "text" in ctx.message ? ctx.message.text : "")?.trim() ?? "";
  const photo =
    ctx.message && "photo" in ctx.message ? ctx.message.photo : undefined;

  switch (draft.step) {
    case "awaiting_title": {
      if (!text || text.length < 6) {
        await ctx.reply("Title is too short. Try again (min 6 characters):");
        return true;
      }
      draft.title = text.slice(0, 200);
      draft.step = "awaiting_company";
      await ctx.reply("Great. What's the company name?");
      return true;
    }
    case "awaiting_company": {
      if (!text) return askAgain(ctx, "Please enter the company name.");
      draft.company = text.slice(0, 200);
      draft.step = "awaiting_description";
      await ctx.reply(
        "Now paste the full job description (min 80 chars, max 6000):",
      );
      return true;
    }
    case "awaiting_description": {
      if (!text || text.length < 80) {
        await ctx.reply(
          `Description must be at least 80 chars. You typed ${text.length}. Try again:`,
        );
        return true;
      }
      draft.description = text.slice(0, 6000);
      draft.step = "awaiting_category";
      const cats = await categoryRepo.list();
      if (cats.length === 0) {
        await ctx.reply(
          "⚠️ No categories configured yet. Ask an admin to add categories.",
        );
        clearDraft(from.id);
        return true;
      }
      const keyboard = cats.map((c) => [
        { text: c.name, callback_data: `pickcat:${c.id}` },
      ]);
      await ctx.reply("Pick a category:", {
        reply_markup: { inline_keyboard: keyboard },
      });
      return true;
    }
    case "awaiting_location": {
      if (!text) return askAgain(ctx, "Where is the job located?");
      draft.location = text.slice(0, 200);
      draft.step = "awaiting_salary";
      await ctx.reply(
        "Salary range? (e.g. `1000-2000 USD` or send `skip` to omit)",
      );
      return true;
    }
    case "awaiting_salary": {
      if (text.toLowerCase() !== "skip") {
        const m = text.match(/(\d+)\s*[-–]\s*(\d+)/);
        if (m) {
          draft.salaryMin = Number(m[1]);
          draft.salaryMax = Number(m[2]);
        } else {
          const single = Number(text.replace(/[^\d]/g, ""));
          if (Number.isFinite(single) && single > 0) draft.salaryMin = single;
        }
      }
      draft.step = "awaiting_apply_url";
      await ctx.reply(
        "Apply URL (e.g. https://...) or send `skip`:",
      );
      return true;
    }
    case "awaiting_apply_url": {
      if (text.toLowerCase() !== "skip") {
        try {
          const url = new URL(text);
          draft.applyUrl = url.toString();
        } catch {
          await ctx.reply("That doesn't look like a valid URL. Try again or `skip`:");
          return true;
        }
      }

      // Create the job in pending_payment now so we can attach payment to it.
      const recentTitles = await jobRepo.recentTitlesByUser(user.id, 10);
      const spam = detectSpam({
        title: draft.title!,
        description: draft.description!,
        applyUrl: draft.applyUrl ?? null,
        recentTitlesByUser: recentTitles,
      });
      if (spam.score >= 80) {
        await ctx.reply(
          `❌ Your submission was rejected by our spam filter.\nReason: ${spam.reasons[0] ?? "high spam score"}`,
        );
        clearDraft(from.id);
        return true;
      }

      const job = await jobRepo.create({
        userId: user.id,
        categoryId: draft.categoryId!,
        title: draft.title!,
        company: draft.company!,
        description: draft.description!,
        employmentType: "full_time",
        location: draft.location!,
        salaryMin: draft.salaryMin ?? null,
        salaryMax: draft.salaryMax ?? null,
        salaryCurrency: "USD",
        applyUrl: draft.applyUrl ?? null,
        status: "pending_payment",
        source: "telegram",
        spamScore: spam.score,
        slug: slugify(draft.title!),
      });
      draft.jobId = job.id;
      draft.step = "awaiting_payment_amount";
      await ctx.reply(
        "💵 How much did you pay? (e.g. `25` for $25 USD, send `0` if you're using a free quota)",
      );
      return true;
    }
    case "awaiting_payment_amount": {
      const amount = Number(text.replace(/[^\d]/g, ""));
      if (!Number.isFinite(amount) || amount < 0) {
        await ctx.reply("Enter a non-negative integer amount.");
        return true;
      }
      draft.paymentAmount = amount;
      draft.step = "awaiting_payment_screenshot";
      await ctx.reply(
        "📸 Send a screenshot of your payment as a photo. (If amount was 0, send a plain `noproof`.)",
      );
      return true;
    }
    case "awaiting_payment_screenshot": {
      if (!photo && text.toLowerCase() !== "noproof") {
        await ctx.reply(
          "Please send the payment screenshot as a photo (not as a file).",
        );
        return true;
      }

      let screenshotUrl = "";
      if (photo) {
        // Largest size variant is last
        const fileId = photo[photo.length - 1]!.file_id;
        const fileLink = await telegramClient.getFileLink(fileId);
        screenshotUrl = await uploadBufferToR2(
          await fetchAsBuffer(fileLink.toString()),
          {
            kind: "payment",
            userId: user.id,
            ext: ".jpg",
            contentType: "image/jpeg",
          },
        );
      }

      await paymentRepo.create({
        jobId: draft.jobId!,
        userId: user.id,
        amount: draft.paymentAmount!,
        currency: "USD",
        method: "bank_transfer",
        screenshotUrl,
        status: "pending",
      });
      await jobRepo.setStatus(draft.jobId!, "pending_review");
      await auditLogRepo.log({
        actorId: user.id,
        action: "job.create",
        targetType: "job",
        targetId: draft.jobId!,
        metadata: { via: "telegram" },
        ip: null,
        userAgent: "telegram",
      });

      await ctx.reply(
        "✅ Submission received! It is now in admin review.\nYou'll get a Telegram message when it's approved or rejected.\nUse /myjobs to track status.",
      );
      await notifyAdmins(
        `🆕 New Telegram submission\nUser: @${user.telegramUsername ?? user.telegramId}\nJob: ${escapeHtml(draft.title!)}\nReview at ${env.NEXT_PUBLIC_APP_URL}/admin/jobs/${draft.jobId}`,
      );

      clearDraft(from.id);
      return true;
    }
    default:
      return false;
  }
}

export async function handleCategoryPick(
  ctx: Context,
  categoryId: string,
): Promise<void> {
  const from = ctx.from;
  if (!from) return;
  const draft = DRAFTS.get(from.id);
  if (!draft || draft.step !== "awaiting_category") {
    await ctx.answerCbQuery("Session expired. Start with /postjob");
    return;
  }
  draft.categoryId = categoryId;
  draft.step = "awaiting_location";
  await ctx.answerCbQuery("Category set");
  await ctx.reply("Where is the job located? (e.g. `Remote`, `Lagos, Nigeria`)");
}

export async function ensureCanPost(
  ctx: Context,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const from = ctx.from;
  if (!from) return { ok: false, reason: "no user" };

  // 1) Membership check
  const inChannel = await isUserInRequiredChannel(from.id);
  if (!inChannel) {
    return {
      ok: false,
      reason:
        `🔒 You must join @${env.TELEGRAM_REQUIRED_CHANNEL} before posting.\n` +
        "Tap Join below, then run /postjob again.",
    };
  }

  // 2) Internal user
  const user = await userRepo.byTelegramId(from.id);
  if (!user) return { ok: false, reason: "Please run /start first." };
  if (user.status !== "active") {
    return { ok: false, reason: "Your account is suspended." };
  }
  await userRepo.setMembershipVerified(user.id, true);

  // 3) Rate limit
  const rl = await rateLimit({
    key: `tg:postjob:${from.id}`,
    limit: 5,
    windowSeconds: 60 * 60 * 24,
  });
  if (!rl.ok) {
    return {
      ok: false,
      reason: `You've hit today's submission limit. Try again in ${Math.ceil(rl.resetInSeconds / 3600)}h.`,
    };
  }

  // 4) Concurrent drafts
  const pending = await jobRepo.countPendingByUser(user.id);
  if (pending >= 3) {
    return {
      ok: false,
      reason: "You already have 3 pending posts. Wait for them to be reviewed.",
    };
  }

  return { ok: true };
}

async function askAgain(ctx: Context, msg: string): Promise<boolean> {
  await ctx.reply(msg);
  return true;
}

async function fetchAsBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`failed to fetch telegram file: ${res.status}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

function escapeHtml(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
