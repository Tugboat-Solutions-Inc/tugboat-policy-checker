"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProfileProps {
  user: {
    fullName?: string;
    imageUrl?: string;
    emailAddresses?: Array<{ emailAddress: string }>;
  };
  className?: string;
}

export function UserAvatarProfile({ user, className }: UserAvatarProfileProps) {
  const initials =
    user.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ||
    user.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ||
    "U";

  return (
    <Avatar className={cn(className)}>
      {user.imageUrl && (
        <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
      )}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
