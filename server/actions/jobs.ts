"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { verifyPaymentWithLeul } from "@/lib/leul-verify";
import {
  methodAccountSuffixLength,
  methodNeedsAccountSuffix,
  methodNeedsPhoneNumber,
  paymentMethodLabel,
} from "@/lib/payment-methods";
import { rateLimit } from "@/lib/rate-limit";
import { detectSpam } from "@/lib/spam";
import { slugify } from "@/lib/format";
import { jobSubmitSchema, jobUpdateSchema } from "@/lib/validations/job";
import { paymentSubmitSchema } from "@/lib/validations/payment";
import { z } from "zod";
import { jobRepo } from "@/server/repositories/job";
import { paymentRepo } from "@/server/repositories/payment";
import { auditLogRepo } from "@/server/repositories/auditLog";
import { publicUrlFor } from "@/lib/r2";
import { notifyAdminsNewSubmission } from "@/lib/telegram/publisher";
import type { User } from "@/server/db/schema";

export interface ActionState {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: unknown;
}

const ok = <T>(data?: T): ActionState => ({ ok: true, data });
const fail = (
  error: string,
  fieldErrors?: Record<string, string[]>,
): ActionState => ({ ok: false, error, fieldErrors });

function normalizeAccountSuffixForMethod(
  method: string,
  rawSuffix: string | null | undefined,
): string | undefined {
  if (!rawSuffix?.trim()) return undefined;
  const requiredLength = methodAccountSuffixLength(method);
  if (!requiredLength) return rawSuffix.trim();
  const digits = rawSuffix.replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.length < requiredLength) return digits;
  return digits.slice(-requiredLength);
}

const checkPaymentReferenceSchema = z.object({
  jobId: z.string().uuid(),
  method: z.string().min(1),
  referenceCode: z.string().trim().min(1),
  accountSuffix: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),
});

/* ──────────────────────────────────────────────
 * Submit a new job (web flow). After this the user uploads payment proof.
 * ────────────────────────────────────────────── */
export async function submitJobAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let user: User;
  try {
    user = await requireUser();
  } catch {
    return fail("You must be signed in to post a job.");
  }

  const parsed = jobSubmitSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("Invalid form input", parsed.error.flatten().fieldErrors);
  }
  const input = parsed.data;

  const rl = await rateLimit({
    key: `submit-job:${user.id}`,
    limit: 5,
    windowSeconds: 60 * 60 * 24,
  });
  if (!rl.ok) {
    return fail(
      `Daily submission limit reached. Try again in ${Math.ceil(rl.resetInSeconds / 3600)}h.`,
    );
  }

  const pending = await jobRepo.countPendingByUser(user.id);
  if (pending >= 3) {
    return fail("You already have 3 pending posts. Wait for review.");
  }

  const recentTitles = await jobRepo.recentTitlesByUser(user.id);
  const spam = detectSpam({
    title: input.title,
    description: input.description,
    applyUrl: input.applyUrl ?? null,
    contactInfo: input.contactInfo ?? null,
    recentTitlesByUser: recentTitles,
  });
  if (spam.score >= 80) {
    return fail(
      `Submission blocked by spam filter: ${spam.reasons.slice(0, 2).join(", ")}`,
    );
  }

  const job = await jobRepo.create({
    userId: user.id,
    categoryId: input.categoryId,
    title: input.title,
    company: input.company,
    description: input.description,
    employmentType: input.employmentType,
    location: input.location,
    salaryMin: input.salaryMin ?? null,
    salaryMax: input.salaryMax ?? null,
    salaryCurrency: input.salaryCurrency,
    applyUrl: input.applyUrl ?? null,
    contactInfo: input.contactInfo ?? null,
    logoUrl: input.logoKey ? publicUrlFor(input.logoKey) : null,
    status: "pending_payment",
    source: "web",
    spamScore: spam.score,
    slug: slugify(input.title),
  });

  await auditLogRepo.log({
    actorId: user.id,
    action: "job.create",
    targetType: "job",
    targetId: job.id,
    metadata: { spamScore: spam.score, source: "web" },
    ip: null,
    userAgent: null,
  });

  revalidatePath("/dashboard/jobs");
  const flow = String(formData.get("flow") ?? "");
  if (flow === "simple") {
    return ok({ jobId: job.id });
  }
  redirect(`/dashboard/jobs/${job.id}/payment`);
}

/* ──────────────────────────────────────────────
 * Update an existing draft / pending job by its owner.
 * ────────────────────────────────────────────── */
export async function updateMyJobAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = jobUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("Invalid form input", parsed.error.flatten().fieldErrors);
  }
  const { id, ...patch } = parsed.data;

  const existing = await jobRepo.byId(id);
  if (!existing) return fail("Job not found");
  if (existing.userId !== user.id) return fail("Not your job");
  if (!["draft", "pending_payment", "rejected"].includes(existing.status)) {
    return fail("This job can no longer be edited");
  }

  await jobRepo.update(id, {
    ...patch,
    logoUrl: patch.logoKey ? publicUrlFor(patch.logoKey) : existing.logoUrl,
  });
  revalidatePath("/dashboard/jobs");
  revalidatePath(`/dashboard/jobs/${id}`);
  return ok();
}

/* ──────────────────────────────────────────────
 * Attach a payment to a job + move it into pending_review.
 * ────────────────────────────────────────────── */
export async function submitPaymentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = paymentSubmitSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("Invalid form input", parsed.error.flatten().fieldErrors);
  }
  const input = parsed.data;

  const job = await jobRepo.byId(input.jobId);
  if (!job || job.userId !== user.id) return fail("Job not found");
  if (job.status !== "pending_payment" && job.status !== "rejected") {
    return fail("This job is not awaiting payment");
  }

  const existing = await paymentRepo.byJobId(job.id);
  if (existing && existing.status === "verified") {
    return fail("Payment already verified for this job");
  }

  const selectedMethod = input.method;
  const selectedSuffix = normalizeAccountSuffixForMethod(
    selectedMethod,
    input.accountSuffix,
  );
  const selectedPhone = input.phoneNumber?.trim() || undefined;

  if (methodNeedsAccountSuffix(selectedMethod) && !selectedSuffix) {
    return fail(
      `${paymentMethodLabel(selectedMethod)} verification requires account suffix`,
      { accountSuffix: ["Required for this method"] },
    );
  }
  if (methodNeedsPhoneNumber(selectedMethod) && !selectedPhone) {
    return fail(
      `${paymentMethodLabel(selectedMethod)} verification requires phone number`,
      { phoneNumber: ["Required for this method"] },
    );
  }

  if (input.referenceCode) {
    const verification = await verifyPaymentWithLeul({
      reference: input.referenceCode,
      method: selectedMethod,
      accountSuffix: selectedSuffix,
      phoneNumber: selectedPhone,
    });
    if (!verification.ok || !verification.verified) {
      return fail(
        verification.error ?? "Could not verify your payment reference",
        { referenceCode: ["Reference check failed"] },
      );
    }
  }

  const payment = existing
    ? await paymentRepo.setStatus(existing.id, "pending", {
        amount: input.amount,
        currency: input.currency,
        method: selectedMethod,
        referenceCode: input.referenceCode ?? null,
        accountSuffix: selectedSuffix ?? null,
        phoneNumber: selectedPhone ?? null,
        screenshotUrl: publicUrlFor(input.screenshotKey),
      })
    : await paymentRepo.create({
        jobId: job.id,
        userId: user.id,
        amount: input.amount,
        currency: input.currency,
        method: selectedMethod,
        referenceCode: input.referenceCode ?? null,
        accountSuffix: selectedSuffix ?? null,
        phoneNumber: selectedPhone ?? null,
        screenshotUrl: publicUrlFor(input.screenshotKey),
        status: "pending",
      });

  if (!payment) {
    return fail("Failed to save payment");
  }

  await jobRepo.setStatus(job.id, "pending_review");
  await auditLogRepo.log({
    actorId: user.id,
    action: "job.update",
    targetType: "payment",
    targetId: payment.id,
    metadata: { amount: input.amount, currency: input.currency },
    ip: null,
    userAgent: null,
  });

  await notifyAdminsNewSubmission(job.id);

  revalidatePath("/dashboard/jobs");
  revalidatePath(`/dashboard/jobs/${job.id}`);
  return ok();
}

export async function checkPaymentReferenceAction(
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = checkPaymentReferenceSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return fail("Enter a valid reference before checking.");
  }

  const { jobId, method, referenceCode, accountSuffix, phoneNumber } =
    parsed.data;
  const job = await jobRepo.byId(jobId);
  if (!job || job.userId !== user.id) return fail("Job not found");

  const selectedSuffix = normalizeAccountSuffixForMethod(method, accountSuffix);
  const selectedPhone = phoneNumber?.trim() || undefined;

  if (methodNeedsAccountSuffix(method) && !selectedSuffix) {
    return fail(
      `${paymentMethodLabel(method)} verification requires account suffix`,
    );
  }
  if (methodNeedsPhoneNumber(method) && !selectedPhone) {
    return fail(
      `${paymentMethodLabel(method)} verification requires phone number`,
    );
  }

  const verification = await verifyPaymentWithLeul({
    reference: referenceCode,
    method,
    accountSuffix: selectedSuffix,
    phoneNumber: selectedPhone,
  });
  if (!verification.ok || !verification.verified) {
    return fail(verification.error ?? "Could not verify your payment reference");
  }

  return ok({
    provider: verification.provider ?? null,
    status: verification.status ?? "Verified",
    transactionId: verification.transactionId ?? null,
    amount: verification.amount ?? null,
  });
}
