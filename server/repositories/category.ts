import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { categories, type Category } from "@/server/db/schema";

export const categoryRepo = {
  list() {
    return db
      .select()
      .from(categories)
      .where(eq(categories.active, true))
      .orderBy(asc(categories.sortOrder), asc(categories.name));
  },

  listAll() {
    return db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.name));
  },

  byId(id: string) {
    return db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)
      .then((r) => r[0] ?? null);
  },

  bySlug(slug: string) {
    return db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1)
      .then((r) => r[0] ?? null);
  },

  create(values: Omit<Category, "id" | "createdAt" | "updatedAt">) {
    return db.insert(categories).values(values).returning().then((r) => r[0]!);
  },

  async update(id: string, patch: Partial<Category>) {
    const [updated] = await db
      .update(categories)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updated ?? null;
  },

  async delete(id: string) {
    await db.delete(categories).where(eq(categories.id, id));
  },
};
