import "server-only";

import { env } from "@/lib/env";
import {
	resolveVerifyMethod,
	type PaymentVerifyMethod,
} from "@/lib/payment-methods";

export type VerifyPaymentInput = {
	reference: string;
	method?: string;
	accountSuffix?: string | null;
	phoneNumber?: string | null;
};

export type VerifyPaymentResult = {
	ok: boolean;
	httpStatus: number;
	verified: boolean;
	provider?: string;
	status?: string;
	transactionId?: string;
	amount?: number;
	raw?: unknown;
	error?: string;
};

const ENDPOINT_BY_METHOD: Record<PaymentVerifyMethod, string> = {
	cbe: "/verify-cbe",
	telebirr: "/verify-telebirr",
	dashen: "/verify-dashen",
	abyssinia: "/verify-abyssinia",
	cbebirr: "/verify-cbebirr",
	mpesa: "/verify-mpesa",
};

function buildRequestBody(
	method: PaymentVerifyMethod | "auto",
	input: VerifyPaymentInput,
): Record<string, string> {
	const body: Record<string, string> = { reference: input.reference };

	if (method === "auto") {
		if (input.accountSuffix?.trim()) {
			body.suffix = input.accountSuffix.trim();
		}
		return body;
	}

	if (method === "cbe" || method === "abyssinia") {
		if (input.accountSuffix?.trim()) {
			body.suffix = input.accountSuffix.trim();
		}
		return body;
	}

	if (method === "cbebirr" || method === "mpesa") {
		if (input.phoneNumber?.trim()) {
			body.phoneNumber = input.phoneNumber.trim();
		}
		return body;
	}

	return body;
}

export function extractLeulVerification(payload: unknown): {
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
		p.verified === true ||
		p.success === true ||
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

export async function verifyPaymentWithLeul(
	input: VerifyPaymentInput,
): Promise<VerifyPaymentResult> {
	const apiKey = env.LEUL_VERIFY_API_KEY;
	if (!apiKey) {
		return {
			ok: false,
			httpStatus: 0,
			verified: false,
			error:
				"Leul verifier not configured. Set LEUL_VERIFY_API_KEY in your environment.",
		};
	}

	const reference = input.reference?.trim();
	if (!reference) {
		return {
			ok: false,
			httpStatus: 0,
			verified: false,
			error: "Reference number is required to verify",
		};
	}

	const resolved = input.method
		? resolveVerifyMethod(input.method)
		: "auto";
	const path =
		resolved === "auto" ? "/verify" : ENDPOINT_BY_METHOD[resolved];
	const baseUrl = env.LEUL_VERIFY_BASE_URL.replace(/\/$/, "");
	const controller = new AbortController();
	const timeoutMs = env.LEUL_VERIFY_TIMEOUT_MS;
	const timeout = setTimeout(() => controller.abort(), timeoutMs);

	let res: Response;
	try {
		res = await fetch(`${baseUrl}${path}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": apiKey,
			},
			body: JSON.stringify(buildRequestBody(resolved, { ...input, reference })),
			signal: controller.signal,
		});
	} catch (err) {
		clearTimeout(timeout);
		const isAbort =
			err instanceof Error &&
			(err.name === "AbortError" || err.message.includes("aborted"));
		const message = err instanceof Error ? err.message : String(err);
		return {
			ok: false,
			httpStatus: 0,
			verified: false,
			error: isAbort
				? `Verifier timed out after ${timeoutMs}ms. Retry in a moment. If this persists on Vercel, host verification in Ethiopia or enable a local fallback proxy as recommended by the provider docs.`
				: `Verifier request failed: ${message}`,
		};
	}
	clearTimeout(timeout);

	const raw = (await res.json().catch(() => null)) as unknown;
	const extracted = extractLeulVerification(raw);

	if (!res.ok) {
		const text =
			raw && typeof raw === "object" && "message" in raw
				? String((raw as { message: unknown }).message)
				: "";
		return {
			ok: false,
			httpStatus: res.status,
			verified: false,
			raw,
			error: `Verifier error: HTTP ${res.status}${text ? ` — ${text}` : ""}`,
		};
	}

	return {
		ok: true,
		httpStatus: res.status,
		verified: extracted.verified,
		provider: extracted.provider,
		status: extracted.status,
		transactionId: extracted.transactionId,
		amount: extracted.amount,
		raw,
		error: extracted.verified
			? undefined
			: `Not verified${extracted.status ? ` (${extracted.status})` : ""}`,
	};
}
