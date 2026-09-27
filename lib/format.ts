import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

type FormatLocale = "en" | "am";

/** date-fns has no Amharic locale yet; relative phrases fall back to English. */
const DATE_LOCALES = {
	en: enUS,
	am: enUS,
} as const;

export function formatRelativeTime(
	date: Date | string | number,
	locale: FormatLocale = "en",
): string {
	const d =
		typeof date === "string" || typeof date === "number"
			? new Date(date)
			: date;
	return formatDistanceToNow(d, {
		addSuffix: true,
		locale: DATE_LOCALES[locale] ?? enUS,
	});
}

type AmountFormatter = (amount: number) => string;

/** Common typos / non-ISO codes stored before validation was tightened. */
const CURRENCY_ALIASES: Record<string, string> = {
	USDU: "USD",
};

function normalizeCurrencyCode(currency: string | null | undefined): string {
	const raw = (currency?.trim() || "USD").toUpperCase();
	return CURRENCY_ALIASES[raw] ?? raw;
}

function isThreeLetterCurrencyCode(
	code: string,
): code is string & { length: 3 } {
	return /^[A-Z]{3}$/.test(code);
}

function intlLocale(locale: FormatLocale): string {
	return locale === "am" ? "am-ET" : "en-US";
}

function tryCurrencyFormatter(
	code: string,
	locale: FormatLocale,
): AmountFormatter | null {
	if (!isThreeLetterCurrencyCode(code)) {
		return null;
	}
	try {
		const fmt = new Intl.NumberFormat(intlLocale(locale), {
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
	locale: FormatLocale = "en",
): AmountFormatter {
	const code = normalizeCurrencyCode(currency);
	const currencyFmt = tryCurrencyFormatter(code, locale);
	if (currencyFmt) {
		return currencyFmt;
	}
	const numberFmt = new Intl.NumberFormat(intlLocale(locale), {
		maximumFractionDigits: 0,
	});
	return (amount) => `${numberFmt.format(amount)} ${code}`;
}

export type SalaryLabels = {
	notSpecified: string;
	from: (amount: string) => string;
	upTo: (amount: string) => string;
};

const DEFAULT_SALARY_LABELS: SalaryLabels = {
	notSpecified: "Salary not specified",
	from: (amount) => `From ${amount}`,
	upTo: (amount) => `Up to ${amount}`,
};

export function formatSalary(
	min: number | null | undefined,
	max: number | null | undefined,
	currency?: string | null,
	options?: { locale?: FormatLocale; labels?: SalaryLabels },
): string {
	const locale = options?.locale ?? "en";
	const labels = options?.labels ?? DEFAULT_SALARY_LABELS;
	if (!min && !max) return labels.notSpecified;
	const fmt = salaryAmountFormatter(currency ?? "USD", locale);
	if (min && max) return `${fmt(min)} – ${fmt(max)}`;
	if (min) return labels.from(fmt(min));
	if (max) return labels.upTo(fmt(max));
	return labels.notSpecified;
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

/** Fallback English title-case; prefer status.* message keys in UI. */
export function statusLabel(status: string): string {
	return status
		.split("_")
		.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
		.join(" ");
}
