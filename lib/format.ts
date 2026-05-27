import { formatDistanceToNow } from "date-fns";

export function formatRelativeTime(date: Date | string | number): string {
	const d =
		typeof date === "string" || typeof date === "number"
			? new Date(date)
			: date;
	return formatDistanceToNow(d, { addSuffix: true });
}

type AmountFormatter = (amount: number) => string;

function normalizeCurrencyCode(currency: string | null | undefined): string {
	return (currency?.trim() || "USD").toUpperCase();
}

function isThreeLetterCurrencyCode(
	code: string,
): code is string & { length: 3 } {
	return /^[A-Z]{3}$/.test(code);
}

function tryCurrencyFormatter(code: string): AmountFormatter | null {
	if (!isThreeLetterCurrencyCode(code)) {
		return null;
	}
	try {
		const fmt = new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: code,
			maximumFractionDigits: 0,
		});
		return (amount) => fmt.format(amount);
	} catch {
		// Invalid ISO 4217 code (e.g. typo stored in DB)
		return null;
	}
}

function salaryAmountFormatter(
	currency: string | null | undefined,
): AmountFormatter {
	const code = normalizeCurrencyCode(currency);
	const currencyFmt = tryCurrencyFormatter(code);
	if (currencyFmt) {
		return currencyFmt;
	}
	const numberFmt = new Intl.NumberFormat("en-US", {
		maximumFractionDigits: 0,
	});
	return (amount) => `${numberFmt.format(amount)} ${code}`;
}

export function formatSalary(
	min: number | null | undefined,
	max: number | null | undefined,
	currency = "USD",
): string {
	if (!min && !max) return "Salary not specified";
	const fmt = salaryAmountFormatter(currency);
	if (min && max) return `${fmt(min)} – ${fmt(max)}`;
	if (min) return `From ${fmt(min)}`;
	if (max) return `Up to ${fmt(max)}`;
	return "Salary not specified";
}

/** Build a URL-safe slug. We append a short random suffix when needed to keep
 *  uniqueness without an expensive lookup loop. */
export function slugify(input: string, withSuffix = true): string {
	const base = input
		.toLowerCase()
		.normalize("NFKD")
		.replace(/\p{M}/gu, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 160);
	if (!withSuffix) return base || "post";
	const suffix = Math.random().toString(36).slice(2, 8);
	return `${base || "post"}-${suffix}`;
}

export function truncate(text: string, max = 160): string {
	if (text.length <= max) return text;
	return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function statusLabel(status: string): string {
	return status
		.split("_")
		.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
		.join(" ");
}
