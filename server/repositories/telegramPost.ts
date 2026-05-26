import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import {
  telegramPosts,
  type TelegramPost,
} from "@/server/db/schema";

export const telegramPostRepo = {
  create(values: Omit<TelegramPost, "id" | "createdAt"> & { id?: string }) {
    return db.insert(telegramPosts).values(values).returning().then(r => r[0]!);
  },

  byJobId(jobId: string) {
    return db
      .select()
      .from(telegramPosts)
      .where(eq(telegramPosts.jobId, jobId))
      .orderBy(desc(telegramPosts.createdAt));
  },

  async incrementClicks(id: string, by = 1) {
    await db
      .update(telegramPosts)
      .set({ clickCount: by })
      .where(eq(telegramPosts.id, id));
  },
};
