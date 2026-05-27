import "server-only";
import { env } from "@/lib/env";
import { telegramClient } from "@/lib/telegram/client";

/** True when a URL is safe for Telegram inline keyboard buttons. */
export function canUseTelegramInlineUrl(url: string): boolean {
	try {
		const u = new URL(url);
		if (u.protocol !== "https:" && u.protocol !== "http:") return false;
		const host = u.hostname.toLowerCase();
		if (
			host === "localhost" ||
			host === "127.0.0.1" ||
			host === "0.0.0.0" ||
			host.endsWith(".localhost")
		) {
			return false;
		}
		return true;
	} catch {
		return false;
	}
}

function parseNotifyChatId(raw: string): number | null {
	const id = Number(raw.trim());
	return Number.isFinite(id) ? id : null;
}

/**
 * Where to send admin alerts.
 * Prefer TELEGRAM_ADMIN_NOTIFY_CHAT_ID; otherwise DM each TELEGRAM_ADMIN_IDS user.
 */
export function resolvePrimaryAdminNotifyTargets(): number[] {
	const notifyChat = env.TELEGRAM_ADMIN_NOTIFY_CHAT_ID;
	if (notifyChat) {
		const id = parseNotifyChatId(notifyChat);
		if (id != null) return [id];
		console.warn(
			"[telegram] TELEGRAM_ADMIN_NOTIFY_CHAT_ID is set but not a valid numeric chat id:",
			notifyChat,
		);
	}
	return [...env.TELEGRAM_ADMIN_IDS];
}

export function resolveFallbackAdminNotifyTargets(
	primary: number[],
): number[] {
	const notifyChat = env.TELEGRAM_ADMIN_NOTIFY_CHAT_ID;
	if (!notifyChat) return [];
	const primarySet = new Set(primary);
	return env.TELEGRAM_ADMIN_IDS.filter((id) => !primarySet.has(id));
}

/**
 * Delivers a notification to admin chat(s). Returns true if at least one send succeeded.
 */
export async function deliverAdminNotification(
	deliver: (chatId: number) => Promise<void>,
): Promise<boolean> {
	const primary = resolvePrimaryAdminNotifyTargets();
	const fallback = resolveFallbackAdminNotifyTargets(primary);
	const targets = [...primary, ...fallback];

	if (targets.length === 0) {
		console.error(
			"[telegram] Admin notification skipped: configure TELEGRAM_ADMIN_NOTIFY_CHAT_ID " +
				"(DM the bot → /chatid) or TELEGRAM_ADMIN_IDS (/myid) in .env, then restart the app.",
		);
		return false;
	}

	const errors: string[] = [];
	let anyOk = false;

	for (const chatId of targets) {
		try {
			await deliver(chatId);
			anyOk = true;
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			errors.push(`${chatId}: ${msg}`);
		}
	}

	if (!anyOk) {
		console.error(
			"[telegram] All admin notifications failed:",
			errors.join("; "),
		);
		if (fallback.length === 0 && env.TELEGRAM_ADMIN_IDS.length > 0) {
			console.error(
				"[telegram] Tip: admins must /start the bot in DM before it can message them. " +
					"Or set TELEGRAM_ADMIN_NOTIFY_CHAT_ID to a group where the bot is a member.",
			);
		}
	}

	return anyOk;
}

export async function sendAdminTextMessage(
	chatId: number,
	text: string,
	options?: Parameters<typeof telegramClient.sendMessage>[2],
): Promise<void> {
	await telegramClient.sendMessage(chatId, text, options);
}
