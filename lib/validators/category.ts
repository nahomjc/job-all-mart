import { z } from "zod";

function emptyToNull(v: unknown): unknown {
  if (v === "" || v === undefined || v === null) return null;
  return v;
}

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
  telegramTopicId: z.preprocess(
    emptyToNull,
    z.union([z.null(), z.coerce.number().int().positive()]),
  ),
  sortOrder: z.coerce.number().int().default(0),
  active: z.preprocess(coerceActive, z.boolean()),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
