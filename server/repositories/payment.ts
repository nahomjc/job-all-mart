import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import {
  payments,
  type NewPayment,
  type Payment,
} from "@/server/db/schema";

export const paymentRepo = {
  byId(id: string) {
    return db.select().from(payments).where(eq(payments.id, id)).limit(1).then(r => r[0] ?? null);
  },

  byJobId(jobId: string) {
    return db
      .select()
      .from(payments)
      .where(eq(payments.jobId, jobId))
      .limit(1)
      .then(r => r[0] ?? null);
  },

  create(values: NewPayment) {
    return db.insert(payments).values(values).returning().then(r => r[0]!);
  },

  async setStatus(
    id: string,
    status: Payment["status"],
    extras: Partial<NewPayment> = {},
  ) {
    const [updated] = await db
      .update(payments)
      .set({
        status,
        ...extras,
        updatedAt: new Date(),
        ...(status === "verified" ? { verifiedAt: new Date() } : {}),
      })
      .where(eq(payments.id, id))
      .returning();
    return updated ?? null;
  },

  pending(limit = 50) {
    return db
      .select()
      .from(payments)
      .where(eq(payments.status, "pending"))
      .orderBy(desc(payments.createdAt))
      .limit(limit);
  },

  listByUser(userId: string) {
    return db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  },
};
