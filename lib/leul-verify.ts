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

const DEFAULT_VERIFY_BASE_URL = "https://verifyapi.leulzenebe.pro";

function getPathCandidates(
	method: PaymentVerifyMethod | "auto",
): string[] {
	if (method === "auto") return ["/verify"];
	// Some deployments expose only the universal route.
	return [ENDPOINT_BY_METHOD[method], "/verify"];
}

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
	const controller = new AbortController();
	const timeoutMs = env.LEUL_VERIFY_TIMEOUT_MS;
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	const configuredBaseUrl = env.LEUL_VERIFY_BASE_URL.replace(/\/$/, "");
	const baseUrls = Array.from(
		new Set([configuredBaseUrl, DEFAULT_VERIFY_BASE_URL]),
	);
	const paths = getPathCandidates(resolved);

	let res: Response | undefined;
	let requestedUrl = "";
	try {
		for (const baseUrl of baseUrls) {
			for (const path of paths) {
				requestedUrl = `${baseUrl}${path}`;
				const current = await fetch(requestedUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-api-key": apiKey,
					},
					body: JSON.stringify(buildRequestBody(resolved, { ...input, reference })),
					signal: controller.signal,
				});
				res = current;
				// Continue trying path/base-url fallbacks only on 404.
				if (current.status !== 404) break;
			}
			if (res?.status !== 404) break;
		}
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
	if (!res) {
		return {
			ok: false,
			httpStatus: 0,
			verified: false,
			error: "Verifier request failed before receiving a response",
		};
	}

	const raw = (await res.json().catch(() => null)) as unknown;
	const extracted = extractLeulVerification(raw);

	if (!res.ok) {
		const text =
			raw && typeof raw === "object" && "message" in raw
				? String((raw as { message: unknown }).message)
				: "";
		if (res.status === 404) {
			return {
				ok: false,
				httpStatus: res.status,
				verified: false,
				raw,
				error:
					"Verifier could not find this reference. Double-check reference/method (and suffix or phone when required), or try another receipt.",
			};
		}
		return {
			ok: false,
			httpStatus: res.status,
			verified: false,
			raw,
			error: `Verifier error: HTTP ${res.status}${
				text ? ` — ${text}` : ""
			} (endpoint: ${requestedUrl})`,
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
