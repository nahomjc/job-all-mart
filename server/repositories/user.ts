import "server-only";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/server/db/client";
import {
  users,
  type NewUser,
  type User,
} from "@/server/db/schema";

export const userRepo = {
  byId(id: string) {
    return db.select().from(users).where(eq(users.id, id)).limit(1).then(r => r[0] ?? null);
  },

  bySupabaseId(supabaseUserId: string) {
    return db
      .select()
      .from(users)
      .where(eq(users.supabaseUserId, supabaseUserId))
      .limit(1)
      .then(r => r[0] ?? null);
  },

  byTelegramId(telegramId: number) {
    return db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramId))
      .limit(1)
      .then(r => r[0] ?? null);
  },

  async upsertFromTelegram(args: {
    telegramId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<User> {
    const existing = await userRepo.byTelegramId(args.telegramId);
    if (existing) {
      // Keep names fresh in case the user renamed.
      const [updated] = await db
        .update(users)
        .set({
          telegramUsername: args.username ?? existing.telegramUsername,
          telegramFirstName: args.firstName ?? existing.telegramFirstName,
          telegramLastName: args.lastName ?? existing.telegramLastName,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id))
        .returning();
      return updated ?? existing;
    }
    const insert: NewUser = {
      telegramId: args.telegramId,
      telegramUsername: args.username,
      telegramFirstName: args.firstName,
      telegramLastName: args.lastName,
      displayName:
        [args.firstName, args.lastName].filter(Boolean).join(" ") ||
        args.username ||
        `tg_${args.telegramId}`,
      authProvider: "telegram",
      source: "telegram",
    };
    const [created] = await db.insert(users).values(insert).returning();
    return created!;
  },

  async setMembershipVerified(userId: string, verified: boolean) {
    await db
      .update(users)
      .set({ telegramVerifiedMembership: verified, updatedAt: new Date() })
      .where(eq(users.id, userId));
  },

  async setStatus(userId: string, status: User["status"], reason?: string) {
    await db
      .update(users)
      .set({ status, banReason: reason ?? null, updatedAt: new Date() })
      .where(eq(users.id, userId));
  },

  async setRole(userId: string, role: User["role"]) {
    await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId));
  },

  /** Allows a Telegram-only user to add web credentials later. */
  async linkSupabase(userId: string, supabaseUserId: string, email: string) {
    await db
      .update(users)
      .set({
        supabaseUserId,
        email,
        authProvider: "supabase",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  },

  list(opts: { limit?: number; offset?: number; onlyWeb?: boolean } = {}) {
    const { limit = 50, offset = 0, onlyWeb } = opts;
    const filter = onlyWeb ? isNotNull(users.supabaseUserId) : undefined;
    return db
      .select()
      .from(users)
      .where(filter ? and(filter) : undefined)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
  },
};
