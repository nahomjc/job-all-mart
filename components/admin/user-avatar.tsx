import { Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  imageUrl?: string | null;
  className?: string;
}

export function UserAvatar({ name, imageUrl, className }: UserAvatarProps) {
  const initials = userInitials(name);

  return (
    <Avatar className={cn("size-10", className)}>
      {imageUrl ? (
        <AvatarImage src={imageUrl} alt={name} className="object-cover" />
      ) : null}
      <AvatarFallback className="bg-muted text-muted-foreground">
        {imageUrl ? (
          initials
        ) : (
          <Building2 className="size-4" aria-hidden />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
