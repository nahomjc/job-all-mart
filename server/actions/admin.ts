"use server";

import { requireAdmin } from "@/lib/auth";
import { env } from "@/lib/env";
import { verifyPaymentWithLeul } from "@/lib/leul-verify";
import {
	methodAccountSuffixLength,
	methodNeedsAccountSuffix,
	methodNeedsPhoneNumber,
	paymentMethodLabel,
} from "@/lib/payment-methods";
import { verifyPaymentReferenceSchema } from "@/lib/validations/payment";
import { telegramClient } from "@/lib/telegram/client";
import { notifyAdmins, publishJobToTelegram } from "@/lib/telegram/publisher";
import { categoryInputSchema } from "@/lib/validators/category";
import { auditLogRepo } from "@/server/repositories/auditLog";
import { categoryRepo } from "@/server/repositories/category";
import { jobRepo } from "@/server/repositories/job";
import { paymentRepo } from "@/server/repositories/payment";
import { userRepo } from "@/server/repositories/user";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export interface AdminActionState {
	ok: boolean;
	error?: string;
	data?: unknown;
}

const okState = <T>(data?: T): AdminActionState => ({ ok: true, data });
const failState = (error: string): AdminActionState => ({ ok: false, error });

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
	const adminLink = `${env.NEXT_PUBLIC_APP_URL}/admin/jobs/${jobId}`;
	try {
		await publishJobToTelegram(jobId);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		await notifyAdmins(
			`⚠️ Job approved but Telegram publish failed\nJob: ${escapeHtml(
				job.title,
			)}\n${adminLink}\nError: ${escapeHtml(message)}`,
		);
		return failState(`Telegram publish failed: ${message}`);
	}
	await auditLogRepo.log({
		actorId: admin.id,
		action: "job.post",
		targetType: "job",
		targetId: jobId,
		metadata: null,
		ip: null,
		userAgent: null,
	});

	await notifyAdmins(
		`✅ Job approved & posted to Telegram\nJob: ${escapeHtml(job.title)}\n${adminLink}`,
	);
	await notifyOwner(jobId, "approved", job.title);

	revalidatePath("/admin/jobs");
	revalidatePath(`/admin/jobs/${jobId}`);
	revalidatePath("/jobs");
	revalidatePath("/");
	return okState();
}

/* ──────────────────────────────────────────────
 * Re-run the Telegram publish step.
 * Useful when the original `approveJobAction` failed mid-flow and left the
 * job at `approved` (status never advanced to `posted`).
 * ────────────────────────────────────────────── */
export async function republishJobAction(
	jobId: string,
): Promise<AdminActionState> {
	const admin = await requireAdmin();
	const job = await jobRepo.byId(jobId);
	if (!job) return failState("Job not found");
	if (job.status !== "approved" && job.status !== "scheduled") {
		return failState(`Cannot republish: job is in status '${job.status}'`);
	}

	try {
		await publishJobToTelegram(jobId);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return failState(`Telegram publish failed: ${message}`);
	}

	await auditLogRepo.log({
		actorId: admin.id,
		action: "job.post",
		targetType: "job",
		targetId: jobId,
		metadata: { note: "Republished via admin retry button." },
		ip: null,
		userAgent: null,
	});

	revalidatePath("/admin/jobs");
	revalidatePath(`/admin/jobs/${jobId}`);
	revalidatePath("/jobs");
	revalidatePath("/");
	return okState();
}

/* ──────────────────────────────────────────────
 * Local-dev escape hatch: mark a job as posted WITHOUT sending to Telegram.
 * Use when Telegram isn't configured / reachable but you still want the job
 * to show up on the public site for UI testing.
 * ────────────────────────────────────────────── */
export async function markJobPostedAction(
	jobId: string,
): Promise<AdminActionState> {
	const admin = await requireAdmin();
	const job = await jobRepo.byId(jobId);
	if (!job) return failState("Job not found");
	if (job.status === "posted") return okState();
	if (job.status === "rejected" || job.status === "expired") {
		return failState(
			`Refusing to mark a '${job.status}' job as posted. Re-approve it first.`,
		);
	}

	await jobRepo.update(jobId, {
		status: "posted",
		postedAt: new Date(),
		expiresAt: job.expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
	});

	await auditLogRepo.log({
		actorId: admin.id,
		action: "job.post",
		targetType: "job",
		targetId: jobId,
		metadata: { note: "Marked posted manually; Telegram step skipped." },
		ip: null,
		userAgent: null,
	});

	revalidatePath("/admin/jobs");
	revalidatePath(`/admin/jobs/${jobId}`);
	revalidatePath("/jobs");
	revalidatePath("/");
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

/* ──────────────────────────────────────────────
 * Leul verifier — check transaction reference
 * @see https://verify.leul.et/docs
 * ────────────────────────────────────────────── */
export async function verifyPaymentReferenceAction(
	_prev: AdminActionState,
	formData: FormData,
): Promise<AdminActionState> {
	await requireAdmin();
	const parsed = verifyPaymentReferenceSchema.safeParse(
		Object.fromEntries(formData),
	);
	if (!parsed.success) {
		return failState(
			parsed.error.flatten().fieldErrors.paymentId?.[0] ??
				"Invalid verification input",
		);
	}

	const { paymentId, reference, method, accountSuffix, phoneNumber } =
		parsed.data;
	const p = await paymentRepo.byId(paymentId);
	if (!p) return failState("Payment not found");
	const selectedMethod = method ?? p.method;

	const ref = reference ?? p.referenceCode ?? "";
	if (!ref.trim()) {
		return failState("Enter a transaction reference to verify");
	}
	const selectedSuffix = normalizeAccountSuffixForMethod(
		selectedMethod,
		accountSuffix ?? p.accountSuffix,
	);
	const selectedPhone = phoneNumber ?? p.phoneNumber;
	if (methodNeedsAccountSuffix(selectedMethod) && !selectedSuffix?.trim()) {
		return failState(
			`${paymentMethodLabel(selectedMethod)} verification requires account suffix`,
		);
	}
	const requiredSuffixLength = methodAccountSuffixLength(selectedMethod);
	if (requiredSuffixLength && selectedSuffix?.trim()) {
		const suffixDigits = selectedSuffix.replace(/\D/g, "");
		if (suffixDigits.length !== requiredSuffixLength) {
			return failState(
				`${paymentMethodLabel(selectedMethod)} requires a ${requiredSuffixLength}-digit account suffix`,
			);
		}
	}
	if (methodNeedsPhoneNumber(selectedMethod) && !selectedPhone?.trim()) {
		return failState(
			`${paymentMethodLabel(selectedMethod)} verification requires phone number`,
		);
	}

	const result = await verifyPaymentWithLeul({
		reference: ref,
		method: selectedMethod,
		accountSuffix: selectedSuffix,
		phoneNumber: selectedPhone,
	});

	if (!result.ok) {
		return failState(result.error ?? "Verification request failed");
	}

	if (!result.verified) {
		return failState(result.error ?? "Transaction not verified");
	}

	return okState({
		reference: ref,
		provider: result.provider ?? null,
		status: result.status ?? "verified",
		transactionId: result.transactionId ?? null,
		amount: result.amount ?? null,
	});
}

/** @deprecated Use verifyPaymentReferenceAction — kept for existing imports */
export async function testLeulVerifyPaymentByReferenceAction(
	paymentId: string,
): Promise<AdminActionState> {
	const fd = new FormData();
	fd.set("paymentId", paymentId);
	return verifyPaymentReferenceAction({ ok: false }, fd);
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
	revalidatePath(`/admin/users/${userId}`);
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
	revalidatePath(`/admin/users/${userId}`);
	return okState();
}

const updateUserRoleSchema = z.object({
	userId: z.string().uuid(),
	role: z.enum(["user", "admin", "owner"]),
});

export async function updateUserRoleAction(
	userId: string,
	role: "user" | "admin" | "owner",
): Promise<AdminActionState> {
	const admin = await requireAdmin();
	const parsed = updateUserRoleSchema.safeParse({ userId, role });
	if (!parsed.success) return failState("Invalid role");

	if (admin.id === userId) {
		return failState("You cannot change your own role.");
	}

	const target = await userRepo.byId(userId);
	if (!target) return failState("User not found");

	if (role === "owner" && admin.role !== "owner") {
		return failState("Only owners can grant the owner role.");
	}

	if (target.role === "owner" && admin.role !== "owner") {
		return failState("Only owners can change another owner's role.");
	}

	if (target.role === role) return okState();

	const previousRole = target.role;
	await userRepo.setRole(userId, role);
	await auditLogRepo.log({
		actorId: admin.id,
		action: "user.role_change",
		targetType: "user",
		targetId: userId,
		metadata: { from: previousRole, to: role },
		ip: null,
		userAgent: null,
	});
	revalidatePath("/admin/users");
	revalidatePath(`/admin/users/${userId}`);
	return okState();
}

/* ──────────────────────────────────────────────
 * Categories
 * ────────────────────────────────────────────── */
export async function createCategoryAction(
	_prev: AdminActionState,
	formData: FormData,
): Promise<AdminActionState> {
	const admin = await requireAdmin();
	const obj = Object.fromEntries(formData);
	const parsed = categoryInputSchema.safeParse({
		...obj,
		active: obj.active ?? true,
	});
	if (!parsed.success) {
		const msg = parsed.error.issues[0]?.message ?? "Invalid category";
		return failState(msg);
	}

	const slugTaken = await categoryRepo.bySlug(parsed.data.slug);
	if (slugTaken) return failState("Slug is already in use");

	try {
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
	} catch {
		return failState(
			"Could not create category (topic ID may already be in use)",
		);
	}
}

export async function updateCategoryFormAction(
	_prev: AdminActionState,
	formData: FormData,
): Promise<AdminActionState> {
	const admin = await requireAdmin();
	const id = formData.get("id");
	if (typeof id !== "string" || id.length === 0) {
		return failState("Missing category id");
	}

	const existing = await categoryRepo.byId(id);
	if (!existing) return failState("Category not found");

	const obj = Object.fromEntries(formData);
	const parsed = categoryInputSchema.safeParse(obj);
	if (!parsed.success) {
		const msg = parsed.error.issues[0]?.message ?? "Invalid category";
		return failState(msg);
	}

	const slugTaken = await categoryRepo.bySlug(parsed.data.slug);
	if (slugTaken && slugTaken.id !== id) {
		return failState("Slug is already in use");
	}

	try {
		await categoryRepo.update(id, parsed.data);
		await auditLogRepo.log({
			actorId: admin.id,
			action: "category.update",
			targetType: "category",
			targetId: id,
			metadata: parsed.data,
			ip: null,
			userAgent: null,
		});
		revalidatePath("/admin/categories");
		return okState();
	} catch {
		return failState(
			"Could not update category (topic ID may already be in use)",
		);
	}
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
