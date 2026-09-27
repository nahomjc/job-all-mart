import "server-only";
import { and, eq, lt } from "drizzle-orm";
import { db } from "@/server/db/client";
import { telegramWebLogins } from "@/server/db/schema";

const TTL_MS = 10 * 60 * 1000;

export const telegramWebLoginRepo = {
  create(nextPath: string) {
    return db
      .insert(telegramWebLogins)
      .values({
        nextPath,
        expiresAt: new Date(Date.now() + TTL_MS),
      })
      .returning()
      .then((r) => {
        const row = r[0];
        if (!row) throw new Error("Failed to create web login session");
        return row;
      });
  },

  byId(id: string) {
    return db
      .select()
      .from(telegramWebLogins)
      .where(eq(telegramWebLogins.id, id))
      .limit(1)
      .then((r) => r[0] ?? null);
  },

  async approve(id: string, telegramId: number) {
    const [row] = await db
      .update(telegramWebLogins)
      .set({ status: "approved", telegramId })
      .where(
        and(
          eq(telegramWebLogins.id, id),
          eq(telegramWebLogins.status, "pending"),
        ),
      )
      .returning();
    return row ?? null;
  },

  async cancel(id: string) {
    const [row] = await db
      .update(telegramWebLogins)
      .set({ status: "cancelled" })
      .where(
        and(
          eq(telegramWebLogins.id, id),
          eq(telegramWebLogins.status, "pending"),
        ),
      )
      .returning();
    return row ?? null;
  },

  async consume(id: string) {
    const [row] = await db
      .update(telegramWebLogins)
      .set({ status: "consumed", consumedAt: new Date() })
      .where(
        and(
          eq(telegramWebLogins.id, id),
          eq(telegramWebLogins.status, "approved"),
        ),
      )
      .returning();
    return row ?? null;
  },

  async purgeExpired() {
    await db
      .delete(telegramWebLogins)
      .where(lt(telegramWebLogins.expiresAt, new Date()));
  },
};
