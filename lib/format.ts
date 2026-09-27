import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

export type FormatLocale = "en" | "am";

/** date-fns has no Amharic locale yet; relative phrases fall back to English. */
const DATE_LOCALES = {
	en: enUS,
	am: enUS,
} as const;

function formatRelativeTimeAmharic(d: Date): string {
	const diffMs = Date.now() - d.getTime();
	const diffSec = Math.max(0, Math.floor(diffMs / 1000));
	if (diffSec < 45) return "ከጥቂት ሰከንዶች በፊት";
	const diffMin = Math.floor(diffSec / 60);
	if (diffMin < 60) return `ከ${diffMin} ደቂቃ በፊት`;
	const diffHours = Math.floor(diffMin / 60);
	if (diffHours < 24) return `ከ${diffHours} ሰዓት በፊት`;
	const diffDays = Math.floor(diffHours / 24);
	if (diffDays === 1) return "ከትናንት ጀምሮ";
	if (diffDays < 30) return `ከ${diffDays} ቀናት በፊት`;
	const diffMonths = Math.floor(diffDays / 30);
	if (diffMonths < 12) return `ከ${diffMonths} ወራት በፊት`;
	const diffYears = Math.floor(diffDays / 365);
	return `ከ${diffYears} ዓመታት በፊት`;
}

export function formatRelativeTime(
	date: Date | string | number,
	locale: FormatLocale = "en",
): string {
	const d =
		typeof date === "string" || typeof date === "number"
			? new Date(date)
			: date;
	if (locale === "am") {
		return formatRelativeTimeAmharic(d);
	}
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

const DEFAULT_SALARY_LABELS_AM: SalaryLabels = {
	notSpecified: "ደመወዝ በስምምነት",
	from: (amount) => `ከ ${amount} ጀምሮ`,
	upTo: (amount) => `እስከ ${amount}`,
};

export function formatSalary(
	min: number | null | undefined,
	max: number | null | undefined,
	currency?: string | null,
	options?: { locale?: FormatLocale; labels?: SalaryLabels },
): string {
	const locale = options?.locale ?? "en";
	const defaultLabels =
		locale === "am" ? DEFAULT_SALARY_LABELS_AM : DEFAULT_SALARY_LABELS;
	const labels = options?.labels ?? defaultLabels;
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

const AMHARIC_STATUS_MAP: Record<string, string> = {
	full_time: "ሙሉ ጊዜ",
	part_time: "የትርፍ ሰዓት",
	contract: "የኮንትራት",
	internship: "የልምምድ",
	temporary: "ጊዜያዊ",
	freelance: "ፍሪላንስ",
	remote: "የርቀት ስራ",
	hybrid: "ድብልቅ (Hybrid)",
	onsite: "በቦታው የሚሰራ (On-site)",
	on_site: "በቦታው የሚሰራ (On-site)",
	draft: "ረቂቅ",
	pending_payment: "ክፍያ በመጠባበቅ ላይ",
	pending_review: "ግምገማ በመጠባበቅ ላይ",
	under_review: "በግምገማ ላይ",
	approved: "ጸድቋል",
	posted: "ተለጥፏል",
	published: "ተለጥፏል",
	rejected: "ውድቅ ተደርጓል",
	expired: "ጊዜው አልፏል",
	pending: "በመጠባበቅ ላይ",
	verified: "ተረጋግጧል",
	failed: "አልተሳካም",
	refunded: "ተመላሽ ተደርጓል",
	cancelled: "የተሰረዘ",
	archived: "የተቀመጠ",
	completed: "የተጠናቀቀ",
};

/** Formats employment type or status with locale awareness. */
export function statusLabel(
	status: string,
	locale: FormatLocale = "en",
): string {
	if (locale === "am") {
		const key = status.trim().toLowerCase();
		if (AMHARIC_STATUS_MAP[key]) {
			return AMHARIC_STATUS_MAP[key];
		}
	}
	return status
		.split("_")
		.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
		.join(" ");
}

const ETHIOPIA_LOCATION_MAP_AM: Record<string, string> = {
	"addis ababa": "አዲስ አበባ",
	"addis ababa, ethiopia": "አዲስ አበባ፣ ኢትዮጵያ",
	adama: "አዳማ (ናዝሬት)",
	"adama (nazret)": "አዳማ (ናዝሬት)",
	"adama, ethiopia": "አዳማ፣ ኢትዮጵያ",
	nazret: "አዳማ (ናዝሬት)",
	"bahir dar": "ባሕር ዳር",
	"bahir dar, ethiopia": "ባሕር ዳር፣ ኢትዮጵያ",
	hawassa: "ሀዋሳ",
	"hawassa, ethiopia": "ሀዋሳ፣ ኢትዮጵያ",
	"dire dawa": "ድሬዳዋ",
	"dire dawa, ethiopia": "ድሬዳዋ፣ ኢትዮጵያ",
	mekelle: "መቀሌ",
	"mekelle, ethiopia": "መቀሌ፣ ኢትዮጵያ",
	gondar: "ጎንደር",
	"gondar, ethiopia": "ጎንደር፣ ኢትዮጵያ",
	jimma: "ጅማ",
	"jimma, ethiopia": "ጅማ፣ ኢትዮጵያ",
	dessie: "ደሴ",
	"dessie, ethiopia": "ደሴ፣ ኢትዮጵያ",
	jijiga: "ጅጅጋ",
	"jijiga, ethiopia": "ጅጅጋ፣ ኢትዮጵያ",
	bishoftu: "ቢሾፍቱ (ደብረዘይት)",
	"bishoftu (debre zeyit)": "ቢሾፍቱ (ደብረዘይት)",
	"bishoftu, ethiopia": "ቢሾፍቱ፣ ኢትዮጵያ",
	"debre zeyit": "ቢሾፍቱ (ደብረዘይት)",
	"debre birhan": "ደብረ ብርሃን",
	"debre markos": "ደብረ ማርቆስ",
	harar: "ሐረር",
	shashemene: "ሻሸመኔ",
	"arba minch": "አርባ ምንጭ",
	hosanna: "ሆሳዕና",
	hosaena: "ሆሳዕና",
	"wolaita sodo": "ወላይታ ሶዶ",
	sodo: "ሶዶ",
	kombolcha: "ኮምቦልቻ",
	nekemte: "ነቀምቴ",
	asella: "አሰላ",
	dilla: "ዲላ",
	remote: "የርቀት ስራ (Remote)",
	"remote (ethiopia)": "የርቀት ስራ (ኢትዮጵያ)",
	"hybrid (addis ababa)": "ድብልቅ - አዲስ አበባ",
	hybrid: "ድብልቅ (Hybrid)",
	anywhere: "ከየትኛውም ቦታ",
	other: "ሌላ",
};

/** Formats location with proper Amharic translations for common Ethiopian cities. */
export function formatLocation(
	location: string | null | undefined,
	locale: FormatLocale = "en",
): string {
	if (!location) return "";
	if (locale !== "am") return location;
	const lower = location.trim().toLowerCase();
	if (ETHIOPIA_LOCATION_MAP_AM[lower]) {
		return ETHIOPIA_LOCATION_MAP_AM[lower];
	}
	if (lower.startsWith("remote")) {
		return `የርቀት ስራ (${location})`;
	}
	if (lower.startsWith("hybrid")) {
		return `ድብልቅ (${location})`;
	}
	return location;
}
