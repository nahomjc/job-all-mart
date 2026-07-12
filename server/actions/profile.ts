"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getBotUsername } from "@/lib/telegram/client";
import { userRepo } from "@/server/repositories/user";

export interface ProfileActionState {
	ok: boolean;
	error?: string;
}

const displayNameSchema = z.object({
	displayName: z
		.string()
		.trim()
		.min(2, "Name must be at least 2 characters")
		.max(80, "Name is too long"),
});

export async function updateDisplayNameAction(
	_prev: ProfileActionState,
	formData: FormData,
): Promise<ProfileActionState> {
	const user = await requireUser();
	const parsed = displayNameSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) {
		return {
			ok: false,
			error: parsed.error.issues[0]?.message ?? "Invalid name",
		};
	}

	await userRepo.updateDisplayName(user.id, parsed.data.displayName);
	revalidatePath("/dashboard/settings");
	revalidatePath("/dashboard");
	return { ok: true };
}

const LINK_CODE_TTL_MS = 10 * 60 * 1000;

export interface StartTelegramLinkState {
	ok: boolean;
	url?: string;
	error?: string;
}

/**
 * Generates a short-lived link code tied to the current web user and returns a
 * Telegram deep link. Opening it runs the bot's `/start link_<code>` handler,
 * which attaches the Telegram account to this user.
 */
export async function startTelegramLinkAction(): Promise<StartTelegramLinkState> {
	const user = await requireUser();

	const botUsername = await getBotUsername();
	if (!botUsername) {
		return {
			ok: false,
			error: "Telegram bot is not configured. Ask an administrator to set it up.",
		};
	}

	const code = randomBytes(16).toString("hex");
	const expiresAt = new Date(Date.now() + LINK_CODE_TTL_MS);
	await userRepo.setTelegramLinkCode(user.id, code, expiresAt);

	return {
		ok: true,
		url: `https://t.me/${botUsername}?start=link_${code}`,
	};
}
