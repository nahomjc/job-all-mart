import { z } from "zod";
import { PAYMENT_VERIFY_METHODS } from "@/lib/payment-methods";

const optionalTrimmed = (max: number) =>
	z
		.string()
		.max(max)
		.optional()
		.transform((v) => {
			const t = v?.trim();
			return t ? t : undefined;
		});

export const paymentSubmitSchema = z.object({
	jobId: z.string().uuid(),
	amount: z.coerce.number().int().positive(),
	currency: z
		.string()
		.trim()
		.toUpperCase()
		.regex(/^[A-Z]{3}$/, "Use a 3-letter ISO currency code (e.g. USD, ETB)")
		.default("USD"),
	method: z.enum(PAYMENT_VERIFY_METHODS).default("telebirr"),
	referenceCode: optionalTrimmed(64),
	accountSuffix: optionalTrimmed(32),
	phoneNumber: optionalTrimmed(20),
	screenshotKey: z.string().min(1, "Upload a payment screenshot"),
});

export type PaymentSubmitInput = z.infer<typeof paymentSubmitSchema>;

export const paymentFormStepSchemas = {
	amount: paymentSubmitSchema.pick({
		amount: true,
		currency: true,
	}),
	reference: paymentSubmitSchema.pick({
		method: true,
		referenceCode: true,
		accountSuffix: true,
		phoneNumber: true,
	}),
	proof: paymentSubmitSchema.pick({
		screenshotKey: true,
	}),
} as const;

export const verifyPaymentReferenceSchema = z.object({
	paymentId: z.string().uuid(),
	reference: optionalTrimmed(64),
	method: z.enum(PAYMENT_VERIFY_METHODS).optional(),
	accountSuffix: optionalTrimmed(32),
	phoneNumber: optionalTrimmed(20),
});

export type VerifyPaymentReferenceInput = z.infer<
	typeof verifyPaymentReferenceSchema
>;
