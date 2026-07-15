import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { pricingPlans, type PricingPlan } from "@/server/db/schema";

export const pricingPlanRepo = {
	listActive() {
		return db
			.select()
			.from(pricingPlans)
			.where(eq(pricingPlans.active, true))
			.orderBy(asc(pricingPlans.sortOrder), asc(pricingPlans.name));
	},

	listAll() {
		return db
			.select()
			.from(pricingPlans)
			.orderBy(asc(pricingPlans.sortOrder), asc(pricingPlans.name));
	},

	byId(id: string) {
		return db
			.select()
			.from(pricingPlans)
			.where(eq(pricingPlans.id, id))
			.limit(1)
			.then((r) => r[0] ?? null);
	},

	bySlug(slug: string) {
		return db
			.select()
			.from(pricingPlans)
			.where(eq(pricingPlans.slug, slug))
			.limit(1)
			.then((r) => r[0] ?? null);
	},

	create(
		values: Omit<PricingPlan, "id" | "createdAt" | "updatedAt">,
	) {
		return db
			.insert(pricingPlans)
			.values(values)
			.returning()
			.then((r) => r[0]!);
	},

	async update(id: string, patch: Partial<PricingPlan>) {
		const [updated] = await db
			.update(pricingPlans)
			.set({ ...patch, updatedAt: new Date() })
			.where(eq(pricingPlans.id, id))
			.returning();
		return updated ?? null;
	},

	async delete(id: string) {
		await db.delete(pricingPlans).where(eq(pricingPlans.id, id));
	},
};
