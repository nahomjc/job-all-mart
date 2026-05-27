export type UserLabelFields = {
	displayName: string | null;
	email: string | null;
	telegramUsername: string | null;
	telegramId: number | null;
};

export type UserAvatarFields = {
	avatarUrl: string | null;
};

export function userDisplayName(user: UserLabelFields): string {
	if (user.displayName?.trim()) return user.displayName.trim();
	if (user.email?.trim()) return user.email.trim();
	if (user.telegramUsername) return `@${user.telegramUsername}`;
	if (user.telegramId != null) return `Telegram ${user.telegramId}`;
	return "Unknown user";
}

export function userInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";

	const first = parts[0];
	if (!first) return "?";
	if (parts.length === 1) return first.slice(0, 2).toUpperCase();

	const second = parts[1];
	return `${first[0] ?? ""}${second?.[0] ?? ""}`.toUpperCase();
}

export function userAvatarUrl(
	user: UserAvatarFields,
	companyLogoUrl?: string | null,
): string | null {
	const url = user.avatarUrl?.trim() || companyLogoUrl?.trim();
	return url || null;
}
