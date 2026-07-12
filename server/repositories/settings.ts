import "server-only";

import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { appSettings } from "@/server/db/schema";

export const SETTINGS_KEYS = {
	telegramBroadcastChannelId: "telegram.broadcast_channel_id",
	telegramBroadcastEnabled: "telegram.broadcast_enabled",
	telegramFooterLinks: "telegram.footer_links",
} as const;

export type TelegramBroadcastSettings = {
	channelId: string | null;
	enabled: boolean;
};

export type TelegramFooterLink = {
	label: string;
	/** External link button. Takes precedence over `popup` when both are set. */
	url: string;
	/** When set (and no url), the button shows this text as a popup alert. */
	popup?: string;
};

/**
 * Default inline buttons appended under every posted job. Three are external
 * links; the last shows the services blurb as a popup (no url).
 */
export const DEFAULT_FOOTER_LINKS: TelegramFooterLink[] = [
	{ label: "በ Tiktok ለመከታተል", url: "https://www.tiktok.com/@makadverts" },
	{
		label: "በ Facebook ለመከታተል",
		url: "https://www.facebook.com/people/MAK-Adverts/100088314116482/",
	},
	{
		label: "በ ውስጥ መስመር MAK Adverts ለማግኘት",
		url: "https://t.me/makadvertscontactcenter",
	},
	{
		label: "MAK Adverts የሚሰጣቸው አገልግሎት",
		url: "",
		popup:
			"የስራ ና የቅጥር ማስታወቂያ post ማረግ\n" +
			"የሚሸጥ የሚከራይ እቃ ቤት መኪና መሬት ማስተዋወቅ\n" +
			"ማንኛውም የቢዝነስ ማስታወቂያ ማስተዋወቅ\n\n" +
			"ከ200 ብር ጀምሮ በቻናላችን ላይ Advert ያድርጉት\n" +
			"Your trusted hub\n" +
			"Fast | Reliable | Accessible\n" +
			"Payment system #Telebirr",
	},
];

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

	/**
	 * Returns the configured footer link buttons. Falls back to the default
	 * labels (with blank URLs) so the admin form always has rows to fill in.
	 */
	async getFooterLinks(): Promise<TelegramFooterLink[]> {
		const raw = await this.get(SETTINGS_KEYS.telegramFooterLinks);
		if (!raw) return DEFAULT_FOOTER_LINKS.map((l) => ({ ...l }));
		try {
			const parsed = JSON.parse(raw);
			if (!Array.isArray(parsed)) return DEFAULT_FOOTER_LINKS.map((l) => ({ ...l }));
			return parsed
				.filter(
					(l): l is TelegramFooterLink =>
						l && typeof l.label === "string" && typeof l.url === "string",
				)
				.map((l) => ({
					label: l.label,
					url: l.url,
					...(typeof l.popup === "string" && l.popup.trim()
						? { popup: l.popup }
						: {}),
				}));
		} catch {
			return DEFAULT_FOOTER_LINKS.map((l) => ({ ...l }));
		}
	},

	async setFooterLinks(links: TelegramFooterLink[]): Promise<void> {
		const cleaned = links
			.map((l) => ({
				label: l.label.trim(),
				url: l.url.trim(),
				popup: l.popup?.trim() ?? "",
			}))
			.filter((l) => l.label.length > 0)
			.map((l) => ({
				label: l.label,
				url: l.url,
				...(l.popup ? { popup: l.popup } : {}),
			}));
		await this.set(SETTINGS_KEYS.telegramFooterLinks, JSON.stringify(cleaned));
	},
};
