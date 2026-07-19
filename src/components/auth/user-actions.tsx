"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

interface UserActionsProps {
  user: AuthUser | null;
}

export function UserActions({ user }: UserActionsProps) {
  const router = useRouter();

  if (!user) {
    return <AuthDialog />;
  }

  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // サーバー側の認証状態(ヘッダー表示等)を再取得する
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open user menu"
            className="rounded-full"
          />
        }
      >
        <Avatar className="size-8">
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        {user.email && (
          <>
            {/* Base UI の仕様上、DropdownMenuLabel は DropdownMenuGroup 内に置く必要がある */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="max-w-72 truncate font-normal text-muted-foreground">
                {user.email}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
