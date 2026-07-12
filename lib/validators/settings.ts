import { z } from "zod";

const telegramChatIdSchema = z
	.string()
	.trim()
	.refine(
		(v) => v.length === 0 || /^-100\d+$/.test(v) || /^@[a-zA-Z][a-zA-Z0-9_]{4,}$/.test(v),
		"Use a numeric chat id (-100…) or @channel_username",
	);

export const telegramBroadcastSettingsSchema = z
	.object({
		channelId: telegramChatIdSchema,
		enabled: z
			.union([z.literal("true"), z.literal("false"), z.boolean()])
			.optional()
			.transform((v) => v === "true" || v === true),
	})
	.superRefine((data, ctx) => {
		if (data.enabled && !data.channelId.trim()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Channel ID is required when broadcast is enabled",
				path: ["channelId"],
			});
		}
	});

export type TelegramBroadcastSettingsInput = z.infer<
	typeof telegramBroadcastSettingsSchema
>;
