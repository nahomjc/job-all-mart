/**
 * Payment providers supported by the Leul verifier API.
 * @see https://verify.leul.et/docs
 */
export const PAYMENT_VERIFY_METHODS = [
	"cbe",
	"telebirr",
	"dashen",
	"abyssinia",
	"cbebirr",
	"mpesa",
] as const;

export type PaymentVerifyMethod = (typeof PAYMENT_VERIFY_METHODS)[number];

export const PAYMENT_METHOD_OPTIONS: {
	value: PaymentVerifyMethod;
	label: string;
	hint: string;
}[] = [
	{
		value: "cbe",
		label: "CBE",
		hint: "Commercial Bank of Ethiopia — reference + account suffix",
	},
	{
		value: "telebirr",
		label: "Telebirr",
		hint: "Telebirr — reference number only",
	},
	{
		value: "dashen",
		label: "Dashen Bank",
		hint: "Dashen — reference number",
	},
	{
		value: "abyssinia",
		label: "Bank of Abyssinia",
		hint: "Abyssinia — reference + suffix",
	},
	{
		value: "cbebirr",
		label: "CBE Birr",
		hint: "CBE Birr — receipt reference + phone",
	},
	{
		value: "mpesa",
		label: "M-Pesa",
		hint: "M-Pesa — receipt reference + phone",
	},
];

export function paymentMethodLabel(method: string): string {
	const found = PAYMENT_METHOD_OPTIONS.find((o) => o.value === method);
	if (found) return found.label;
	const legacy: Record<string, string> = {
		bank_transfer: "Bank transfer",
		mobile_money: "Mobile money",
		crypto: "Crypto",
		card: "Card",
		other: "Other",
	};
	return legacy[method] ?? method;
}

export function methodNeedsAccountSuffix(method: string): boolean {
	return method === "cbe" || method === "abyssinia";
}

export function methodNeedsPhoneNumber(method: string): boolean {
	return method === "cbebirr" || method === "mpesa";
}

/** Map stored method to a verifier provider; unknown/legacy uses smart router. */
export function resolveVerifyMethod(
	method: string,
): PaymentVerifyMethod | "auto" {
	if (
		(PAYMENT_VERIFY_METHODS as readonly string[]).includes(method)
	) {
		return method as PaymentVerifyMethod;
	}
	if (method === "bank_transfer") return "cbe";
	if (method === "mobile_money") return "telebirr";
	return "auto";
}
