import "server-only";
import { asc, desc, eq, inArray, sql, and } from "drizzle-orm";
import { db } from "@/server/db/client";
import {
  payments,
  jobs,
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
    return db
      .insert(payments)
      .values(values)
      .returning()
      .then((r) => {
        const row = r[0];
        if (!row) throw new Error("Failed to create payment");
        return row;
      });
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

  /** Dashboard: server-side search + filter + sort (scoped to a single user). */
  listDashboardPayments(opts: {
    userId: string;
    statuses?: Payment["status"][];
    q?: string;
    sortBy?: "createdAt" | "updatedAt" | "amount" | "method" | "status";
    sortDir?: "asc" | "desc";
    limit?: number;
    offset?: number;
  }) {
    const {
      userId,
      statuses,
      q,
      sortBy = "createdAt",
      sortDir = "desc",
      limit = 50,
      offset = 0,
    } = opts;

    const normalizedQ = q?.trim();
    const allowedStatuses: Payment["status"][] = ["pending", "verified", "rejected"];
    const filterStatuses =
      statuses && statuses.length > 0
        ? statuses.filter((s) => allowedStatuses.includes(s))
        : allowedStatuses;

    const orderExpr =
      sortBy === "updatedAt"
        ? payments.updatedAt
        : sortBy === "amount"
          ? payments.amount
          : sortBy === "method"
            ? payments.method
            : sortBy === "status"
              ? payments.status
              : payments.createdAt;

    return db
      .select({ payment: payments })
      .from(payments)
      .leftJoin(jobs, eq(jobs.id, payments.jobId))
      .where(
        and(
          eq(payments.userId, userId),
          inArray(payments.status, filterStatuses),
          normalizedQ
            ? sql`(
                ${jobs.title} ILIKE ${`%${normalizedQ}%`}
                OR ${jobs.company} ILIKE ${`%${normalizedQ}%`}
                OR ${payments.referenceCode} ILIKE ${`%${normalizedQ}%`}
                OR ${payments.method} ILIKE ${`%${normalizedQ}%`}
              )`
            : undefined,
        ),
      )
      .orderBy(
        sortDir === "asc" ? asc(orderExpr) : desc(orderExpr),
        desc(payments.createdAt),
      )
      .limit(limit)
      .offset(offset);
  },

  /** Admin: server-side search + filter + sort (all users). */
  listAdminPayments(opts: {
    statuses?: Payment["status"][];
    q?: string;
    sortBy?: "createdAt" | "updatedAt" | "amount" | "method" | "status";
    sortDir?: "asc" | "desc";
    limit?: number;
    offset?: number;
  }) {
    const {
      statuses,
      q,
      sortBy = "createdAt",
      sortDir = "desc",
      limit = 50,
      offset = 0,
    } = opts;

    const normalizedQ = q?.trim();
    const allowedStatuses: Payment["status"][] = ["pending", "verified", "rejected"];
    const filterStatuses =
      statuses && statuses.length > 0
        ? statuses.filter((s) => allowedStatuses.includes(s))
        : allowedStatuses;

    const orderExpr =
      sortBy === "updatedAt"
        ? payments.updatedAt
        : sortBy === "amount"
          ? payments.amount
          : sortBy === "method"
            ? payments.method
            : sortBy === "status"
              ? payments.status
              : payments.createdAt;

    return db
      .select({ payment: payments })
      .from(payments)
      .leftJoin(jobs, eq(jobs.id, payments.jobId))
      .where(
        and(
          inArray(payments.status, filterStatuses),
          normalizedQ
            ? sql`(
                ${jobs.title} ILIKE ${`%${normalizedQ}%`}
                OR ${jobs.company} ILIKE ${`%${normalizedQ}%`}
                OR ${payments.referenceCode} ILIKE ${`%${normalizedQ}%`}
                OR ${payments.method} ILIKE ${`%${normalizedQ}%`}
              )`
            : undefined,
        ),
      )
      .orderBy(
        sortDir === "asc" ? asc(orderExpr) : desc(orderExpr),
        desc(payments.createdAt),
      )
      .limit(limit)
      .offset(offset);
  },
};
