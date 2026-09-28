import {
  DEFAULT_TELEBIRR_ACCOUNT,
} from "@/lib/env";

/**
 * Telebirr account number employers should send payment to.
 * Prefers public env (client-safe), then server env, then default.
 */
export function getTelebirrAccount(): string {
  const fromPublic = process.env.NEXT_PUBLIC_PAYMENT_TELEBIRR_ACCOUNT?.trim();
  if (fromPublic) return fromPublic;
  const fromServer = process.env.PAYMENT_TELEBIRR_ACCOUNT?.trim();
  if (fromServer) return fromServer;
  return DEFAULT_TELEBIRR_ACCOUNT;
}
