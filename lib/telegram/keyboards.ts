import { Markup } from "telegraf";
import { env } from "@/lib/env";

export function requiredChannelUrl(): string {
  return `https://t.me/${env.TELEGRAM_REQUIRED_CHANNEL}`;
}

/** Opens the public channel users must join before /postjob. */
export function joinRequiredChannelKeyboard() {
  return Markup.inlineKeyboard([
    Markup.button.url(
      `Join @${env.TELEGRAM_REQUIRED_CHANNEL}`,
      requiredChannelUrl(),
    ),
  ]);
}
