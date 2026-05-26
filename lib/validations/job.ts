import { z } from "zod";

export const jobSubmitSchema = z.object({
  title: z
    .string()
    .min(6, "Title must be at least 6 characters")
    .max(200, "Title must be at most 200 characters"),
  company: z
    .string()
    .min(2, "Company name is required")
    .max(200, "Company name too long"),
  description: z
    .string()
    .min(80, "Description must be at least 80 characters")
    .max(6000, "Description must be at most 6000 characters"),
  categoryId: z.string().uuid("Pick a category"),
  employmentType: z.enum([
    "full_time",
    "part_time",
    "contract",
    "internship",
    "remote",
  ]),
  location: z.string().min(2).max(200),
  salaryMin: z.coerce.number().int().nonnegative().optional().nullable(),
  salaryMax: z.coerce.number().int().nonnegative().optional().nullable(),
  salaryCurrency: z.string().min(3).max(8).default("USD"),
  applyUrl: z
    .string()
    .url("Apply URL must be a valid URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  contactInfo: z.string().max(500).optional(),
  logoKey: z.string().optional(), // R2 object key returned from presign flow
});

export type JobSubmitInput = z.infer<typeof jobSubmitSchema>;

export const jobUpdateSchema = jobSubmitSchema.partial().extend({
  id: z.string().uuid(),
});

export type JobUpdateInput = z.infer<typeof jobUpdateSchema>;
