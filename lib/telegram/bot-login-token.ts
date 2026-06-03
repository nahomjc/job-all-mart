import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

const TOKEN_TTL_SECONDS = 600;

function signPayload(payload: string): string {
  return createHmac("sha256", env.TELEGRAM_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");
}

export function createBotLoginToken(telegramId: number): string {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const payload = `${telegramId}:${exp}`;
  const sig = signPayload(payload);
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyBotLoginToken(
  token: string,
): { telegramId: number } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon <= 0) return null;

    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);
    const expected = signPayload(payload);

    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expected, "hex");
    if (
      sigBuf.length !== expectedBuf.length ||
      !timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return null;
    }

    const [idPart, expPart] = payload.split(":");
    const telegramId = Number(idPart);
    const exp = Number(expPart);
    if (!Number.isFinite(telegramId) || telegramId <= 0) return null;
    if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return { telegramId };
  } catch {
    return null;
  }
}
