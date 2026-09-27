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
		hint: "Commercial Bank of Ethiopia, reference + account suffix",
	},
	{
		value: "telebirr",
		label: "Telebirr",
		hint: "Telebirr, reference number only",
	},
	{
		value: "dashen",
		label: "Dashen Bank",
		hint: "Dashen, reference number",
	},
	{
		value: "abyssinia",
		label: "Bank of Abyssinia",
		hint: "Abyssinia, reference + suffix",
	},
	{
		value: "cbebirr",
		label: "CBE Birr",
		hint: "CBE Birr, receipt reference + phone",
	},
	{
		value: "mpesa",
		label: "M-Pesa",
		hint: "M-Pesa, receipt reference + phone",
	},
];

export function paymentMethodLabel(method: string, locale?: string): string {
	const isAm = locale === "am";
	if (method === "cbe") return isAm ? "የኢትዮጵያ ንግድ ባንክ (CBE)" : "CBE";
	if (method === "telebirr") return isAm ? "ቴሌብር (Telebirr)" : "Telebirr";
	if (method === "dashen") return isAm ? "ዳሽን ባንክ (Dashen Bank)" : "Dashen Bank";
	if (method === "abyssinia") return isAm ? "አቢሲንያ ባንክ (Bank of Abyssinia)" : "Bank of Abyssinia";
	if (method === "cbebirr") return isAm ? "ሲቢኢ ብር (CBE Birr)" : "CBE Birr";
	if (method === "mpesa") return isAm ? "ኤም-ፔሳ (M-Pesa)" : "M-Pesa";

	const legacy: Record<string, { en: string; am: string }> = {
		bank_transfer: { en: "Bank transfer", am: "የባንክ ሂሳብ ማስተላለፍ" },
		mobile_money: { en: "Mobile money", am: "የሞባይል ገንዘብ" },
		crypto: { en: "Crypto", am: "ክሪፕቶ" },
		card: { en: "Card", am: "ካርድ" },
		other: { en: "Other", am: "ሌላ" },
	};
	if (legacy[method]) {
		return isAm ? legacy[method].am : legacy[method].en;
	}
	const found = PAYMENT_METHOD_OPTIONS.find((o) => o.value === method);
	if (found) return found.label;
	return method;
}

export function methodNeedsAccountSuffix(method: string): boolean {
	return method === "cbe" || method === "abyssinia";
}

export function methodNeedsPhoneNumber(method: string): boolean {
	return method === "cbebirr" || method === "mpesa";
}

export function methodAccountSuffixLength(method: string): number | null {
	if (method === "cbe") return 8;
	if (method === "abyssinia") return 5;
	return null;
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
