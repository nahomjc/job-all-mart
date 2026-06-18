/**
 * Type-safe environment access. Throws on first use if a required var is
 * missing, with a clear message naming the offender.
 *
 * Usage:
 *   import { env } from "@/lib/env";
 *   const url = env.DATABASE_URL;
 */
function required(name: string, value: string | undefined): string {
	if (!value || value.length === 0) {
		throw new Error(
			`Missing required environment variable: ${name}. See .env.example for the full list.`,
		);
	}
	return value;
}

function optional(value: string | undefined): string | undefined {
	return value && value.length > 0 ? value : undefined;
}

export const DEFAULT_APP_NAME = "Mak Advert";

/** Old deploy env values — map to current brand on read */
const LEGACY_APP_NAMES = new Set([
	"muler jobs",
	"jobpost",
	"all mart dhs",
	"job post",
]);

export function resolveAppName(raw?: string): string {
	const name = (raw ?? DEFAULT_APP_NAME).trim();
	if (!name) return DEFAULT_APP_NAME;
	if (LEGACY_APP_NAMES.has(name.toLowerCase())) return DEFAULT_APP_NAME;
	return name;
}

export const env = {
	// App
	get NEXT_PUBLIC_APP_URL() {
		return required("NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL);
	},
	get NEXT_PUBLIC_APP_NAME() {
		return resolveAppName(process.env.NEXT_PUBLIC_APP_NAME);
	},

	// Database
	get DATABASE_URL() {
		return required("DATABASE_URL", process.env.DATABASE_URL);
	},

	// Supabase
	get NEXT_PUBLIC_SUPABASE_URL() {
		return required(
			"NEXT_PUBLIC_SUPABASE_URL",
			process.env.NEXT_PUBLIC_SUPABASE_URL,
		);
	},
	get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
		return required(
			"NEXT_PUBLIC_SUPABASE_ANON_KEY",
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		);
	},
	get SUPABASE_SERVICE_ROLE_KEY() {
		return required(
			"SUPABASE_SERVICE_ROLE_KEY",
			process.env.SUPABASE_SERVICE_ROLE_KEY,
		);
	},

	// R2
	get R2_ACCOUNT_ID() {
		return required("R2_ACCOUNT_ID", process.env.R2_ACCOUNT_ID);
	},
	get R2_ACCESS_KEY_ID() {
		return required("R2_ACCESS_KEY_ID", process.env.R2_ACCESS_KEY_ID);
	},
	get R2_SECRET_ACCESS_KEY() {
		return required("R2_SECRET_ACCESS_KEY", process.env.R2_SECRET_ACCESS_KEY);
	},
	get R2_BUCKET() {
		return required("R2_BUCKET", process.env.R2_BUCKET);
	},
	get R2_PUBLIC_BASE_URL() {
		return optional(process.env.R2_PUBLIC_BASE_URL);
	},

	// Telegram
	get TELEGRAM_BOT_TOKEN() {
		return required("TELEGRAM_BOT_TOKEN", process.env.TELEGRAM_BOT_TOKEN);
	},
	get TELEGRAM_CHANNEL_ID() {
		return required("TELEGRAM_CHANNEL_ID", process.env.TELEGRAM_CHANNEL_ID);
	},
	get TELEGRAM_REQUIRED_CHANNEL() {
		return required(
			"TELEGRAM_REQUIRED_CHANNEL",
			process.env.TELEGRAM_REQUIRED_CHANNEL,
		);
	},
	/** Numeric supergroup/channel id for membership checks (required for private invite-only groups). */
	get TELEGRAM_REQUIRED_CHAT_ID() {
		return optional(process.env.TELEGRAM_REQUIRED_CHAT_ID);
	},
	/** Invite link for Join button, e.g. `https://t.me/+wo7yTwl1yEhkOTRk` or `+wo7yTwl1yEhkOTRk`. */
	get TELEGRAM_REQUIRED_CHANNEL_INVITE() {
		return optional(process.env.TELEGRAM_REQUIRED_CHANNEL_INVITE);
	},
	/** Optional label in bot copy, e.g. `all-mart-job-post`. */
	get TELEGRAM_REQUIRED_CHANNEL_LABEL() {
		return optional(process.env.TELEGRAM_REQUIRED_CHANNEL_LABEL);
	},
	get TELEGRAM_WEBHOOK_SECRET() {
		return required(
			"TELEGRAM_WEBHOOK_SECRET",
			process.env.TELEGRAM_WEBHOOK_SECRET,
		);
	},
	get TELEGRAM_ADMIN_IDS(): number[] {
		const raw = process.env.TELEGRAM_ADMIN_IDS ?? "";
		return raw
			.split(",")
			.map((s) => Number(s.trim()))
			.filter((n) => Number.isFinite(n) && n > 0);
	},
	get TELEGRAM_ADMIN_NOTIFY_CHAT_ID() {
		return optional(process.env.TELEGRAM_ADMIN_NOTIFY_CHAT_ID);
	},

	// Cron
	get CRON_SECRET() {
		return required("CRON_SECRET", process.env.CRON_SECRET);
	},

	// Leul Zenebe receipt verifier (https://verify.leul.et/docs/)
	get LEUL_VERIFY_API_KEY() {
		return optional(process.env.LEUL_VERIFY_API_KEY);
	},
	get LEUL_VERIFY_BASE_URL() {
		// Docs: POST https://verifyapi.leulzenebe.pro/verify
		return (
			process.env.LEUL_VERIFY_BASE_URL ?? "https://verifyapi.leulzenebe.pro"
		);
	},
	get LEUL_VERIFY_TIMEOUT_MS() {
		const raw = process.env.LEUL_VERIFY_TIMEOUT_MS;
		if (!raw) return 30000;
		const parsed = Number(raw);
		if (!Number.isFinite(parsed) || parsed < 5000) return 30000;
		return Math.trunc(parsed);
	},
} as const;
