/**
 * Join-link helpers (safe for Server and Client Components).
 */

export function buildRequiredChannelJoinUrl(options: {
  username: string;
  invite?: string | null;
}): string {
  const invite = options.invite?.trim();
  if (invite) {
    if (invite.startsWith("http://") || invite.startsWith("https://")) {
      return invite;
    }
    if (invite.startsWith("+")) return `https://t.me/${invite}`;
    return `https://t.me/+${invite}`;
  }
  return `https://t.me/${options.username}`;
}
