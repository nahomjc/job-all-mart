import { z } from "zod";

function coerceActive(v: unknown): boolean {
	return v === true || v === "true" || v === "on" || v === 1 || v === "1";
}

function coerceHighlight(v: unknown): boolean {
	return v === true || v === "true" || v === "on" || v === 1 || v === "1";
}

function featuresFromInput(v: unknown): string[] {
	if (Array.isArray(v)) {
		return v.map(String).map((s) => s.trim()).filter(Boolean);
	}
	if (typeof v !== "string") return [];
	return v
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

export const pricingPlanInputSchema = z.object({
	name: z.string().trim().min(2).max(128),
	slug: z
		.string()
		.trim()
		.min(2)
		.max(64)
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			"Use lowercase letters, numbers, and hyphens",
		),
	description: z
		.string()
		.trim()
		.optional()
		.nullable()
		.transform((v) => (v && v.length > 0 ? v : null)),
	priceLabel: z.string().trim().min(1).max(64),
	cadence: z.string().trim().max(32).default("/post"),
	features: z.preprocess(featuresFromInput, z.array(z.string()).max(20)),
	ctaLabel: z.string().trim().min(1).max(64).default("Post a job"),
	ctaHref: z.string().trim().min(1).max(256).default("/post/new"),
	highlight: z.preprocess(coerceHighlight, z.boolean()),
	sortOrder: z.coerce.number().int().default(0),
	active: z.preprocess(coerceActive, z.boolean()),
});

export type PricingPlanInput = z.infer<typeof pricingPlanInputSchema>;
