import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatUserName } from "@/lib/format";

interface UserAvatarProps {
  user: { firstName: string; lastName: string; avatarUrl: string | null };
  size?: "default" | "sm" | "lg";
}

export function UserAvatar({ user, size }: UserAvatarProps) {
  const name = formatUserName(user);
  const initial = (name || "?").charAt(0).toUpperCase();

  return (
    <Avatar size={size}>
      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={name} />}
      <AvatarFallback>{initial}</AvatarFallback>
    </Avatar>
  );
}
