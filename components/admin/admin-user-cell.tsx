import Link from "next/link";
import type { User } from "@/server/db/schema";
import {
  userAvatarUrl,
  userDisplayName,
} from "@/lib/user-display";
import { UserAvatar } from "@/components/admin/user-avatar";
import { cn } from "@/lib/utils";

interface AdminUserCellProps {
  user: User;
  companyLogoUrl?: string | null;
  href?: string;
  className?: string;
}

export function AdminUserCell({
  user,
  companyLogoUrl,
  href,
  className,
}: AdminUserCellProps) {
  const name = userDisplayName(user);
  const avatarUrl = userAvatarUrl(user, companyLogoUrl);
  const email = user.email?.trim();

  const content = (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <UserAvatar name={name} imageUrl={avatarUrl} />
      <div className="min-w-0">
        <p className="truncate font-medium leading-tight">{name}</p>
        <p className="truncate text-sm text-muted-foreground">
          {email ?? (user.telegramUsername ? `@${user.telegramUsername}` : "—")}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-md outline-none ring-offset-background transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
      >
        {content}
      </Link>
    );
  }

  return content;
}
