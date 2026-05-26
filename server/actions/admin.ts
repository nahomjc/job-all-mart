"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { publishJobToTelegram } from "@/lib/telegram/publisher";
import { telegramClient } from "@/lib/telegram/client";
import { jobRepo } from "@/server/repositories/job";
import { paymentRepo } from "@/server/repositories/payment";
import { userRepo } from "@/server/repositories/user";
import { auditLogRepo } from "@/server/repositories/auditLog";
import { categoryRepo } from "@/server/repositories/category";
import { env } from "@/lib/env";

export interface AdminActionState {
  ok: boolean;
  error?: string;
  data?: unknown;
}

const okState = <T>(data?: T): AdminActionState => ({ ok: true, data });
const failState = (error: string): AdminActionState => ({ ok: false, error });

/* ──────────────────────────────────────────────
 * Approve job — guards against unverified payment, then publishes.
 * ────────────────────────────────────────────── */
export async function approveJobAction(
  jobId: string,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const job = await jobRepo.byId(jobId);
  if (!job) return failState("Job not found");

  // Submission lock: payment must be verified.
  const payment = await paymentRepo.byJobId(jobId);
  if (payment && payment.status !== "verified") {
    return failState("Cannot approve: payment is not verified.");
  }

  await jobRepo.setStatus(jobId, "approved");
  await auditLogRepo.log({
    actorId: admin.id,
    action: "job.approve",
    targetType: "job",
    targetId: jobId,
    metadata: null,
    ip: null,
    userAgent: null,
  });

  // Publish immediately unless the admin scheduled it elsewhere.
  await publishJobToTelegram(jobId);
  await auditLogRepo.log({
    actorId: admin.id,
    action: "job.post",
    targetType: "job",
    targetId: jobId,
    metadata: null,
    ip: null,
    userAgent: null,
  });

  await notifyOwner(jobId, "approved", job.title);

  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/jobs");
  return okState();
}

const rejectSchema = z.object({
  jobId: z.string().uuid(),
  reason: z.string().min(3).max(500),
});

export async function rejectJobAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const parsed = rejectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failState("Provide a rejection reason");
  const { jobId, reason } = parsed.data;

  await jobRepo.setStatus(jobId, "rejected", { rejectionReason: reason });
  await auditLogRepo.log({
    actorId: admin.id,
    action: "job.reject",
    targetType: "job",
    targetId: jobId,
    metadata: { reason },
    ip: null,
    userAgent: null,
  });

  const job = await jobRepo.byId(jobId);
  if (job) await notifyOwner(jobId, "rejected", job.title, reason);

  revalidatePath("/admin/jobs");
  return okState();
}

const scheduleSchema = z.object({
  jobId: z.string().uuid(),
  scheduledAt: z.coerce.date(),
});

export async function scheduleJobAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const parsed = scheduleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failState("Pick a valid future time");
  const { jobId, scheduledAt } = parsed.data;
  if (scheduledAt.getTime() <= Date.now())
    return failState("scheduledAt must be in the future");

  const payment = await paymentRepo.byJobId(jobId);
  if (payment && payment.status !== "verified")
    return failState("Verify payment before scheduling");

  await jobRepo.setStatus(jobId, "scheduled", { scheduledAt });
  await auditLogRepo.log({
    actorId: admin.id,
    action: "job.schedule",
    targetType: "job",
    targetId: jobId,
    metadata: { scheduledAt: scheduledAt.toISOString() },
    ip: null,
    userAgent: null,
  });
  revalidatePath("/admin/jobs");
  return okState();
}

const featureSchema = z.object({
  jobId: z.string().uuid(),
  pinDays: z.coerce.number().int().min(0).max(30).default(1),
});

export async function featureJobAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const parsed = featureSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failState("Invalid input");
  const { jobId, pinDays } = parsed.data;
  const pinUntil =
    pinDays > 0 ? new Date(Date.now() + pinDays * 24 * 3600 * 1000) : null;

  await jobRepo.update(jobId, { isFeatured: true, pinUntil });
  await auditLogRepo.log({
    actorId: admin.id,
    action: "job.feature",
    targetType: "job",
    targetId: jobId,
    metadata: { pinDays },
    ip: null,
    userAgent: null,
  });
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  return okState();
}

/* ──────────────────────────────────────────────
 * Payment verification
 * ────────────────────────────────────────────── */
export async function verifyPaymentAction(
  paymentId: string,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const p = await paymentRepo.byId(paymentId);
  if (!p) return failState("Payment not found");
  await paymentRepo.setStatus(paymentId, "verified", { verifiedBy: admin.id });
  await auditLogRepo.log({
    actorId: admin.id,
    action: "payment.verify",
    targetType: "payment",
    targetId: paymentId,
    metadata: null,
    ip: null,
    userAgent: null,
  });
  revalidatePath("/admin/payments");
  revalidatePath("/admin/jobs");
  return okState();
}

const rejectPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  reason: z.string().min(3).max(500),
});

export async function rejectPaymentAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const parsed = rejectPaymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return failState("Provide a reason");
  const { paymentId, reason } = parsed.data;
  await paymentRepo.setStatus(paymentId, "rejected", {
    rejectionReason: reason,
  });
  await auditLogRepo.log({
    actorId: admin.id,
    action: "payment.reject",
    targetType: "payment",
    targetId: paymentId,
    metadata: { reason },
    ip: null,
    userAgent: null,
  });
  revalidatePath("/admin/payments");
  return okState();
}

/* ──────────────────────────────────────────────
 * Users — ban / unban / role
 * ────────────────────────────────────────────── */
export async function banUserAction(
  userId: string,
  reason: string,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  await userRepo.setStatus(userId, "banned", reason);
  await auditLogRepo.log({
    actorId: admin.id,
    action: "user.ban",
    targetType: "user",
    targetId: userId,
    metadata: { reason },
    ip: null,
    userAgent: null,
  });
  revalidatePath("/admin/users");
  return okState();
}

export async function unbanUserAction(
  userId: string,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  await userRepo.setStatus(userId, "active");
  await auditLogRepo.log({
    actorId: admin.id,
    action: "user.unban",
    targetType: "user",
    targetId: userId,
    metadata: null,
    ip: null,
    userAgent: null,
  });
  revalidatePath("/admin/users");
  return okState();
}

/* ──────────────────────────────────────────────
 * Categories
 * ────────────────────────────────────────────── */
const categorySchema = z.object({
  name: z.string().min(2).max(128),
  slug: z.string().min(2).max(64),
  description: z.string().optional().nullable(),
  telegramTopicId: z.coerce.number().int().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  active: z.coerce.boolean().default(true),
});

export async function createCategoryAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const obj = Object.fromEntries(formData);
  const parsed = categorySchema.safeParse(obj);
  if (!parsed.success) return failState("Invalid category");
  const created = await categoryRepo.create({
    ...parsed.data,
    icon: null,
  } as never);
  await auditLogRepo.log({
    actorId: admin.id,
    action: "category.create",
    targetType: "category",
    targetId: created.id,
    metadata: parsed.data,
    ip: null,
    userAgent: null,
  });
  revalidatePath("/admin/categories");
  return okState();
}

export async function updateCategoryAction(
  id: string,
  patch: { name?: string; telegramTopicId?: number | null; active?: boolean },
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  await categoryRepo.update(id, patch);
  await auditLogRepo.log({
    actorId: admin.id,
    action: "category.update",
    targetType: "category",
    targetId: id,
    metadata: patch,
    ip: null,
    userAgent: null,
  });
  revalidatePath("/admin/categories");
  return okState();
}

/* ──────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────── */
async function notifyOwner(
  jobId: string,
  outcome: "approved" | "rejected",
  title: string,
  reason?: string,
): Promise<void> {
  const job = await jobRepo.byIdWithRelations(jobId);
  if (!job?.employer?.telegramId) return;
  const text =
    outcome === "approved"
      ? `✅ Your job <b>${escapeHtml(title)}</b> was approved and posted!\nSee it on the channel.`
      : `❌ Your job <b>${escapeHtml(title)}</b> was rejected.\nReason: ${escapeHtml(reason ?? "")}\nEdit and resubmit at ${env.NEXT_PUBLIC_APP_URL}/dashboard`;
  try {
    await telegramClient.sendMessage(job.employer.telegramId, text, {
      parse_mode: "HTML",
    });
  } catch (err) {
    console.warn("notifyOwner failed:", err);
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
