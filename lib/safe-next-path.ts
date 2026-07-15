/** Only allow same-origin relative paths (blocks open redirects). */
export function safeNextPath(raw: unknown, fallback = "/dashboard"): string {
	if (typeof raw !== "string") return fallback;
	const path = raw.trim();
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
		return fallback;
	}
	return path;
}
