import "server-only";
import { Telegram } from "telegraf";
import { env } from "@/lib/env";
import {
  requiredChatIdForApi,
  type MembershipCheckResult,
} from "@/lib/telegram/required-channel";

let _client: Telegram | null = null;

function tg(): Telegram {
  if (_client) return _client;
  _client = new Telegram(env.TELEGRAM_BOT_TOKEN);
  return _client;
}

const MEMBER_STATUSES = new Set([
  "creator",
  "administrator",
  "member",
  "restricted",
]);

/**
 * Checks whether a user is a member of the configured required group/channel.
 * The bot must be an administrator in that chat for the API call to succeed.
 */
export async function checkRequiredChannelMembership(
  telegramUserId: number,
): Promise<MembershipCheckResult> {
  try {
    const member = await tg().getChatMember(
      requiredChatIdForApi(),
      telegramUserId,
    );
    return MEMBER_STATUSES.has(member.status)
      ? { status: "member" }
      : { status: "not_member" };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.warn(
      "[telegram] membership check failed for",
      requiredChatIdForApi(),
      detail,
    );
    return { status: "check_failed", detail };
  }
}

export async function isUserInRequiredChannel(
  telegramUserId: number,
): Promise<boolean> {
  const result = await checkRequiredChannelMembership(telegramUserId);
  return result.status === "member";
}

let _botUsername: string | null = null;

/**
 * Resolves the bot's @username from its token via getMe(), cached for the
 * lifetime of the process. Falls back to NEXT_PUBLIC_TELEGRAM_BOT_USERNAME.
 * Returns null when neither is available.
 */
export async function getBotUsername(): Promise<string | null> {
  if (_botUsername) return _botUsername;
  const fromEnv = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  if (fromEnv) {
    _botUsername = fromEnv;
    return _botUsername;
  }
  try {
    const me = await tg().getMe();
    if (me.username) {
      _botUsername = me.username;
      return _botUsername;
    }
  } catch (err) {
    console.warn(
      "[telegram] getMe failed while resolving bot username:",
      err instanceof Error ? err.message : String(err),
    );
  }
  return null;
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
