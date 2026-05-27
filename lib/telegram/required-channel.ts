import "server-only";
import { env } from "@/lib/env";
import { buildRequiredChannelJoinUrl } from "@/lib/required-channel-links";

/** Display name in bot messages (defaults to @username). */
export function requiredChannelLabel(): string {
  return env.TELEGRAM_REQUIRED_CHANNEL_LABEL ?? `@${env.TELEGRAM_REQUIRED_CHANNEL}`;
}

/** Link for the Join button. Private groups use invite links (`+hash`), not @username. */
export function requiredChannelJoinUrl(): string {
  return buildRequiredChannelJoinUrl({
    username: env.TELEGRAM_REQUIRED_CHANNEL,
    invite: env.TELEGRAM_REQUIRED_CHANNEL_INVITE,
  });
}

/**
 * Chat id passed to Telegram `getChatMember`.
 * Prefer numeric id for private supergroups; @username works for public channels.
 */
export function requiredChatIdForApi(): string {
  const id = env.TELEGRAM_REQUIRED_CHAT_ID;
  if (id) return id;
  return `@${env.TELEGRAM_REQUIRED_CHANNEL}`;
}

export type MembershipCheckResult =
  | { status: "member" }
  | { status: "not_member" }
  | { status: "check_failed"; detail: string };
