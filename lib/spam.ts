import "server-only";

/**
 * Simple, dependency-free spam scoring. Higher score = more suspicious.
 *
 * We deliberately keep the rules transparent so admins can reason about why a
 * post got flagged. Anything ≥ 50 should auto-route to manual review; ≥ 80
 * should be rejected on submission.
 *
 * For a "real" AI-based detector you would replace `score()` with a call to
 * a moderation model — the rest of the app only depends on the score number.
 */

const BLACKLIST_KEYWORDS: ReadonlyArray<RegExp> = [
  /\bwork from home\s+\$+\d+/i,
  /\b(crypto|forex|invest(ment)?)\s+(opportunit|signal|profit|guaranteed)/i,
  /\b(make|earn)\s+\$?\d{2,}\s+(per|a)\s+(day|hour|week)/i,
  /\b(cash app|chime|gift card|western union)\b.*\bpay/i,
  /\b(only fans|onlyfans|adult content|escort)\b/i,
  /\b(mlm|pyramid|multi[-\s]?level marketing)\b/i,
  /\b(pyramid|ponzi|get rich quick)\b/i,
];

const SUSPICIOUS_TLDS = [".xyz", ".click", ".top", ".loan", ".tk", ".ml"];

export interface SpamSignal {
  score: number;
  reasons: string[];
}

export interface SpamInput {
  title: string;
  description: string;
  applyUrl?: string | null;
  contactInfo?: string | null;
  recentTitlesByUser?: ReadonlyArray<string>;
}

export function detectSpam(input: SpamInput): SpamSignal {
  let score = 0;
  const reasons: string[] = [];

  const haystack = `${input.title}\n${input.description}\n${input.contactInfo ?? ""}`;

  for (const re of BLACKLIST_KEYWORDS) {
    if (re.test(haystack)) {
      score += 25;
      reasons.push(`blacklist:${re.source.slice(0, 40)}`);
    }
  }

  // Excessive uppercase = shouting
  const letters = input.title.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 8) {
    const upperRatio =
      letters.split("").filter((c) => c === c.toUpperCase()).length /
      letters.length;
    if (upperRatio > 0.7) {
      score += 15;
      reasons.push("title_shouting");
    }
  }

  // Too many emoji / non-ascii in title
  const nonAscii = (input.title.match(/[^\x00-\x7F]/g) ?? []).length;
  if (nonAscii > 6) {
    score += 10;
    reasons.push("title_excessive_emoji");
  }

  // Suspicious URL TLDs
  const urls = extractUrls(haystack);
  for (const u of urls) {
    if (SUSPICIOUS_TLDS.some((t) => u.hostname.endsWith(t))) {
      score += 20;
      reasons.push(`suspicious_tld:${u.hostname}`);
    }
    if (u.username || u.password) {
      score += 30;
      reasons.push("url_credentials");
    }
  }

  // Phone-only contact with no website
  if (
    !input.applyUrl &&
    /\b\+?\d[\d\s().-]{7,}\b/.test(input.contactInfo ?? "")
  ) {
    score += 5;
    reasons.push("phone_only_contact");
  }

  // Duplicate title (very strong signal)
  if (input.recentTitlesByUser?.length) {
    const t = input.title.trim().toLowerCase();
    const dupe = input.recentTitlesByUser.some(
      (prev) => prev.trim().toLowerCase() === t,
    );
    if (dupe) {
      score += 40;
      reasons.push("duplicate_title");
    }
  }

  // Very short description
  if (input.description.trim().length < 60) {
    score += 10;
    reasons.push("description_too_short");
  }

  return { score: Math.min(score, 100), reasons };
}

function extractUrls(text: string): URL[] {
  const matches = text.match(/\bhttps?:\/\/\S+/gi) ?? [];
  const out: URL[] = [];
  for (const m of matches) {
    try {
      out.push(new URL(m));
    } catch {
      // ignore malformed
    }
  }
  return out;
}
