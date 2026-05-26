import { formatDistanceToNow } from "date-fns";

export function formatRelativeTime(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatSalary(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string = "USD",
): string {
  if (!min && !max) return "Salary not specified";
  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  if (min && max) return `${fmt.format(min)} – ${fmt.format(max)}`;
  if (min) return `From ${fmt.format(min)}`;
  if (max) return `Up to ${fmt.format(max)}`;
  return "Salary not specified";
}

/** Build a URL-safe slug. We append a short random suffix when needed to keep
 *  uniqueness without an expensive lookup loop. */
export function slugify(input: string, withSuffix = true): string {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
  if (!withSuffix) return base || "post";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "post"}-${suffix}`;
}

export function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

export function statusLabel(status: string): string {
  return status
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}
