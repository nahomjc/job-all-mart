"use server";

import { requireAdmin } from "@/lib/auth";
import { env } from "@/lib/env";
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
 * Leul verifier test (by reference)
 * ────────────────────────────────────────────── */
function extractLeulVerification(payload: unknown): {
	verified: boolean;
	status?: string;
	provider?: string;
	transactionId?: string;
	amount?: number;
} {
	if (!payload || typeof payload !== "object") {
		return { verified: false };
	}

	const p = payload as Record<string, unknown>;
	const data =
		typeof p.data === "object" && p.data !== null
			? (p.data as Record<string, unknown>)
			: undefined;
	const transaction =
		typeof p.transaction === "object" && p.transaction !== null
			? (p.transaction as Record<string, unknown>)
			: undefined;

	const statusRaw =
		(typeof p.status === "string" ? p.status : undefined) ??
		(typeof transaction?.status === "string"
			? transaction.status
			: undefined) ??
		(typeof data?.status === "string" ? data.status : undefined);

	const status = typeof statusRaw === "string" ? statusRaw : undefined;

	const isVerifiedRaw = p.is_verified;
	const isVerified =
		isVerifiedRaw === true ||
		(typeof status === "string" && status.toLowerCase().includes("verified"));

	const provider =
		(typeof data?.provider === "string" ? data.provider : undefined) ??
		(typeof p.provider === "string" ? p.provider : undefined);

	const transactionId =
		(typeof p.transaction_id === "string" ? p.transaction_id : undefined) ??
		(typeof transaction?.transaction_id === "string"
			? transaction.transaction_id
			: undefined);

	const amount =
		typeof data?.amount === "number"
			? data.amount
			: typeof p.amount === "number"
				? p.amount
				: undefined;

	return { verified: isVerified, status, provider, transactionId, amount };
}

export async function testLeulVerifyPaymentByReferenceAction(
	paymentId: string,
): Promise<AdminActionState> {
	const admin = await requireAdmin();
	const p = await paymentRepo.byId(paymentId);
	if (!p) return failState("Payment not found");

	if (!p.referenceCode) return failState("No reference code on this payment");

	const apiKey = env.LEUL_VERIFY_API_KEY;
	if (!apiKey) {
		return failState(
			"Leul verifier not configured. Set LEUL_VERIFY_API_KEY in your environment.",
		);
	}

	const baseUrl = env.LEUL_VERIFY_BASE_URL;
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 15000);

	let res: Response;
	try {
		res = await fetch(`${baseUrl}/verify`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": apiKey,
			},
			body: JSON.stringify({
				reference: p.referenceCode,
			}),
			signal: controller.signal,
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		clearTimeout(timeout);
		return failState(`Leul verifier request failed: ${message}`);
	}
	clearTimeout(timeout);

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		return failState(
			`Leul verifier error: HTTP ${res.status}${text ? ` - ${text}` : ""}`,
		);
	}

	const json = (await res.json().catch(() => null)) as unknown;
	const extracted = extractLeulVerification(json);

	if (!extracted.verified) {
		return failState(
			`Leul verifier: not verified${
				extracted.status ? ` (${extracted.status})` : ""
			}`,
		);
	}

	return okState({
		reference: p.referenceCode,
		provider: extracted.provider ?? null,
		status: extracted.status ?? "verified",
		transactionId: extracted.transactionId ?? null,
		amount: extracted.amount ?? null,
		testedBy: admin.id,
	});
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
