import "server-only";
import { and, count, desc, eq, gte, inArray, lt, lte, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import {
  categories,
  jobs,
  type Job,
  type NewJob,
  users,
} from "@/server/db/schema";

export const jobRepo = {
  byId(id: string) {
    return db.select().from(jobs).where(eq(jobs.id, id)).limit(1).then(r => r[0] ?? null);
  },

  bySlug(slug: string) {
    return db.select().from(jobs).where(eq(jobs.slug, slug)).limit(1).then(r => r[0] ?? null);
  },

  /** Job + category + employer details, joined. */
  async byIdWithRelations(id: string) {
    const rows = await db
      .select({
        job: jobs,
        category: categories,
        employer: users,
      })
      .from(jobs)
      .leftJoin(categories, eq(categories.id, jobs.categoryId))
      .leftJoin(users, eq(users.id, jobs.userId))
      .where(eq(jobs.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  create(values: NewJob) {
    return db.insert(jobs).values(values).returning().then(r => r[0]!);
  },

  async update(id: string, patch: Partial<NewJob>) {
    const [updated] = await db
      .update(jobs)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return updated ?? null;
  },

  async setStatus(id: string, status: Job["status"], extras: Partial<NewJob> = {}) {
    const [updated] = await db
      .update(jobs)
      .set({ status, ...extras, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return updated ?? null;
  },

  /** Public listings: status='posted' and not expired. */
  listPublic(opts: {
    limit?: number;
    offset?: number;
    categoryId?: string;
    q?: string;
    employmentType?: Job["employmentType"];
  } = {}) {
    const { limit = 20, offset = 0, categoryId, q, employmentType } = opts;
    const where = and(
      eq(jobs.status, "posted"),
      categoryId ? eq(jobs.categoryId, categoryId) : undefined,
      employmentType ? eq(jobs.employmentType, employmentType) : undefined,
      q
        ? sql`(${jobs.title} ILIKE ${"%" + q + "%"} OR ${jobs.company} ILIKE ${"%" + q + "%"} OR ${jobs.description} ILIKE ${"%" + q + "%"})`
        : undefined,
    );
    return db
      .select({ job: jobs, category: categories })
      .from(jobs)
      .leftJoin(categories, eq(categories.id, jobs.categoryId))
      .where(where)
      .orderBy(desc(jobs.isFeatured), desc(jobs.postedAt), desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);
  },

  listByUser(userId: string) {
    return db
      .select({ job: jobs, category: categories })
      .from(jobs)
      .leftJoin(categories, eq(categories.id, jobs.categoryId))
      .where(eq(jobs.userId, userId))
      .orderBy(desc(jobs.createdAt));
  },

  /** Used by spam detection — recent titles by a single employer. */
  async recentTitlesByUser(userId: string, limit = 10): Promise<string[]> {
    const rows = await db
      .select({ title: jobs.title })
      .from(jobs)
      .where(eq(jobs.userId, userId))
      .orderBy(desc(jobs.createdAt))
      .limit(limit);
    return rows.map((r) => r.title);
  },

  async countPendingByUser(userId: string): Promise<number> {
    const [row] = await db
      .select({ n: count() })
      .from(jobs)
      .where(
        and(
          eq(jobs.userId, userId),
          inArray(jobs.status, [
            "draft",
            "pending_payment",
            "pending_review",
            "scheduled",
          ]),
        ),
      );
    return row?.n ?? 0;
  },

  async countSubmittedToday(userId: string): Promise<number> {
    const since = new Date(Date.now() - 24 * 3600 * 1000);
    const [row] = await db
      .select({ n: count() })
      .from(jobs)
      .where(and(eq(jobs.userId, userId), gte(jobs.createdAt, since)));
    return row?.n ?? 0;
  },

  /** Admin queue: jobs awaiting action. */
  listAdminQueue(opts: { status?: Job["status"]; limit?: number; offset?: number } = {}) {
    const { status, limit = 50, offset = 0 } = opts;
    return db
      .select({ job: jobs, category: categories, employer: users })
      .from(jobs)
      .leftJoin(categories, eq(categories.id, jobs.categoryId))
      .leftJoin(users, eq(users.id, jobs.userId))
      .where(
        status
          ? eq(jobs.status, status)
          : inArray(jobs.status, ["pending_review", "pending_payment"]),
      )
      .orderBy(desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);
  },

  /** Cron: jobs whose `scheduledAt` is due. */
  listDueScheduled(now: Date) {
    return db
      .select()
      .from(jobs)
      .where(and(eq(jobs.status, "scheduled"), lte(jobs.scheduledAt, now)));
  },

  /** Cron: jobs whose `expiresAt` has passed. */
  listDueExpired(now: Date) {
    return db
      .select()
      .from(jobs)
      .where(and(eq(jobs.status, "posted"), lt(jobs.expiresAt, now)));
  },
};
