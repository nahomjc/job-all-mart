import "server-only";
import { Telegram } from "telegraf";
import { env } from "@/lib/env";

let _client: Telegram | null = null;

function tg(): Telegram {
  if (_client) return _client;
  _client = new Telegram(env.TELEGRAM_BOT_TOKEN);
  return _client;
}

/**
 * Checks whether a user is a member of the configured required channel.
 * Telegram requires the bot to be an admin in the channel for this to work.
 */
export async function isUserInRequiredChannel(
  telegramUserId: number,
): Promise<boolean> {
  try {
    const member = await tg().getChatMember(
      `@${env.TELEGRAM_REQUIRED_CHANNEL}`,
      telegramUserId,
    );
    return ["creator", "administrator", "member", "restricted"].includes(
      member.status,
    );
  } catch (err) {
    // Bot not admin in channel, or user blocked the bot — treat as not a member.
    console.warn("[telegram] membership check failed:", err);
    return false;
  }
}

export const telegramClient = {
  get raw() {
    return tg();
  },
  sendMessage: (...args: Parameters<Telegram["sendMessage"]>) =>
    tg().sendMessage(...args),
  sendPhoto: (...args: Parameters<Telegram["sendPhoto"]>) =>
    tg().sendPhoto(...args),
  getFile: (fileId: string) => tg().getFile(fileId),
  getFileLink: (fileId: string) => tg().getFileLink(fileId),
};
