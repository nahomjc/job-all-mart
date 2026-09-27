import { z } from "zod";

function coerceActive(v: unknown): boolean {
  return v === true || v === "true" || v === "on" || v === 1 || v === "1";
}

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2).max(128),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  description: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  // Empty/hidden field must become null — Number("") === 0 and fails .positive().
  telegramTopicId: z.preprocess((v) => {
    if (v === "" || v === undefined || v === null) return null;
    if (typeof v === "string" && v.trim() === "") return null;
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.trunc(n);
  }, z.number().int().positive().nullable()),
  sortOrder: z.coerce.number().int().default(0),
  active: z.preprocess(coerceActive, z.boolean()),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
