import "server-only";

import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { appSettings } from "@/server/db/schema";

export const SETTINGS_KEYS = {
	telegramBroadcastChannelId: "telegram.broadcast_channel_id",
	telegramBroadcastEnabled: "telegram.broadcast_enabled",
} as const;

export type TelegramBroadcastSettings = {
	channelId: string | null;
	enabled: boolean;
};

export const settingsRepo = {
	async get(key: string): Promise<string | null> {
		const row = await db
			.select({ value: appSettings.value })
			.from(appSettings)
			.where(eq(appSettings.key, key))
			.then((r) => r[0]);
		return row?.value ?? null;
	},

	async set(key: string, value: string | null): Promise<void> {
		await db
			.insert(appSettings)
			.values({
				key,
				value,
				updatedAt: sql`now()`,
			})
			.onConflictDoUpdate({
				target: appSettings.key,
				set: {
					value,
					updatedAt: sql`now()`,
				},
			});
	},

	async getTelegramBroadcast(): Promise<TelegramBroadcastSettings> {
		const [channelId, enabledRaw] = await Promise.all([
			this.get(SETTINGS_KEYS.telegramBroadcastChannelId),
			this.get(SETTINGS_KEYS.telegramBroadcastEnabled),
		]);

		const channelIdTrimmed = channelId?.trim() ?? "";
		return {
			channelId: channelIdTrimmed.length > 0 ? channelIdTrimmed : null,
			enabled: enabledRaw === "true" || enabledRaw === "1",
		};
	},

	async setTelegramBroadcast(input: TelegramBroadcastSettings): Promise<void> {
		await Promise.all([
			this.set(
				SETTINGS_KEYS.telegramBroadcastChannelId,
				input.channelId?.trim() || null,
			),
			this.set(
				SETTINGS_KEYS.telegramBroadcastEnabled,
				input.enabled ? "true" : "false",
			),
		]);
	},
};
