import "server-only";

import { createHash, createHmac } from "node:crypto";

type TelegramAuthPayload = {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
};

export type VerifiedTelegramAuth = {
  telegramId: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
};

export function verifyTelegramLoginPayload(
  payload: TelegramAuthPayload,
  botToken: string,
  maxAgeSeconds = 3600,
): VerifiedTelegramAuth {
  const { hash, ...rest } = payload;
  if (!hash) throw new Error("Missing Telegram hash");

  const authDateUnix = Number(rest.auth_date);
  if (!Number.isFinite(authDateUnix)) {
    throw new Error("Invalid Telegram auth_date");
  }

  const nowUnix = Math.floor(Date.now() / 1000);
  if (nowUnix - authDateUnix > maxAgeSeconds) {
    throw new Error("Telegram login data expired");
  }

  const dataCheckString = Object.entries(rest)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHash("sha256").update(botToken).digest();
  const expectedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (expectedHash !== hash) {
    throw new Error("Invalid Telegram signature");
  }

  const telegramId = Number(rest.id);
  if (!Number.isFinite(telegramId) || telegramId <= 0) {
    throw new Error("Invalid Telegram id");
  }

  return {
    telegramId,
    firstName: rest.first_name,
    lastName: rest.last_name,
    username: rest.username,
    photoUrl: rest.photo_url,
  };
}

export function telegramSyntheticEmail(telegramId: number): string {
  return `tg_${telegramId}@telegram.local`;
}

export function telegramSyntheticPassword(
  telegramId: number,
  secret: string,
): string {
  const digest = createHmac("sha256", secret)
    .update(`telegram-login:${telegramId}`)
    .digest("hex");
  return `${digest}Aa1!`;
}
