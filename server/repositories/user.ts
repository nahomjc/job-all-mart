import "server-only";

import { db } from "@/server/db/client";
import { type NewUser, type User, users } from "@/server/db/schema";
import { jobRepo } from "@/server/repositories/job";
import { paymentRepo } from "@/server/repositories/payment";
import { and, desc, eq, isNotNull } from "drizzle-orm";

export type AdminUserListRow = {
	user: User;
	jobCount: number;
	companyLogoUrl: string | null;
};

export type AdminUserProfile = {
	user: User;
	jobCount: number;
	companyLogoUrl: string | null;
	jobs: Awaited<ReturnType<typeof jobRepo.listByUser>>;
	payments: Awaited<ReturnType<typeof paymentRepo.listByUserWithJobs>>;
};

export const userRepo = {
	byId(id: string): Promise<User | null> {
		return db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1)
			.then((r) => r[0] ?? null);
	},

	bySupabaseId(supabaseUserId: string): Promise<User | null> {
		return db
			.select()
			.from(users)
			.where(eq(users.supabaseUserId, supabaseUserId))
			.limit(1)
			.then((r) => r[0] ?? null);
	},

	byTelegramId(telegramId: number): Promise<User | null> {
		return db
			.select()
			.from(users)
			.where(eq(users.telegramId, telegramId))
			.limit(1)
			.then((r) => r[0] ?? null);
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
		if (!created) {
			throw new Error("Failed to create user from Telegram");
		}
		return created;
	},

	async setMembershipVerified(
		userId: string,
		verified: boolean,
	): Promise<void> {
		await db
			.update(users)
			.set({ telegramVerifiedMembership: verified, updatedAt: new Date() })
			.where(eq(users.id, userId));
	},

	async setStatus(
		userId: string,
		status: User["status"],
		reason?: string,
	): Promise<void> {
		await db
			.update(users)
			.set({ status, banReason: reason ?? null, updatedAt: new Date() })
			.where(eq(users.id, userId));
	},

	async setRole(userId: string, role: User["role"]): Promise<void> {
		await db
			.update(users)
			.set({ role, updatedAt: new Date() })
			.where(eq(users.id, userId));
	},

	/** Allows a Telegram-only user to add web credentials later. */
	async linkSupabase(
		userId: string,
		supabaseUserId: string,
		email: string,
	): Promise<void> {
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

	list(
		opts: { limit?: number; offset?: number; onlyWeb?: boolean } = {},
	): Promise<User[]> {
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

	async listForAdmin(
		opts: { limit?: number; offset?: number; onlyWeb?: boolean } = {},
	): Promise<AdminUserListRow[]> {
		const rows = await userRepo.list(opts);
		const ids = rows.map((u) => u.id);
		const [jobCounts, logos] = await Promise.all([
			jobRepo.countsByUserIds(ids),
			jobRepo.latestLogosByUserIds(ids),
		]);
		return rows.map((user) => ({
			user,
			jobCount: jobCounts.get(user.id) ?? 0,
			companyLogoUrl: logos.get(user.id) ?? null,
		}));
	},

	async adminProfile(userId: string): Promise<AdminUserProfile | null> {
		const user = await userRepo.byId(userId);
		if (!user) return null;

		const [jobCount, companyLogoUrl, jobs, payments] = await Promise.all([
			jobRepo.countByUser(userId),
			jobRepo.latestCompanyLogoByUser(userId),
			jobRepo.listByUser(userId),
			paymentRepo.listByUserWithJobs(userId),
		]);

		return { user, jobCount, companyLogoUrl, jobs, payments };
	},
};
