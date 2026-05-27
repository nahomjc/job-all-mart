import { z } from "zod";

export const paymentSubmitSchema = z.object({
  jobId: z.string().uuid(),
  amount: z.coerce.number().int().positive(),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Use a 3-letter ISO currency code (e.g. USD, ETB)")
    .default("USD"),
  method: z
    .enum(["bank_transfer", "mobile_money", "crypto", "card", "other"])
    .default("bank_transfer"),
  referenceCode: z.string().max(64).optional(),
  screenshotKey: z.string().min(1, "Upload a payment screenshot"),
});

export type PaymentSubmitInput = z.infer<typeof paymentSubmitSchema>;
