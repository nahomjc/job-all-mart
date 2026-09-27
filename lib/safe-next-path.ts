/** Only allow same-origin relative paths (blocks open redirects).
 *  Strips a leading locale prefix (`/en`, `/am`) so next-intl redirect stays correct. */
export function safeNextPath(raw: unknown, fallback = "/post/new"): string {
	if (typeof raw !== "string") return fallback;
	let path = raw.trim();
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
		return fallback;
	}
	const localeMatch = path.match(/^\/(en|am)(?=\/|$)/);
	if (localeMatch) {
		path = path.slice(localeMatch[0].length) || "/";
	}
	return path;
}
