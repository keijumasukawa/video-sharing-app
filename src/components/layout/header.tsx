import Link from "next/link";
import { UserActions } from "@/components/auth/user-actions";
import { GitHubLink } from "@/components/layout/github-link";
import { Logo } from "@/components/layout/logo";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { Separator } from "@/components/ui/separator";
import type { AuthUser } from "@/lib/auth";

interface HeaderProps {
  navTrigger: React.ReactNode;
  user: AuthUser | null;
}

export function Header({ navTrigger, user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-[var(--header-height,3.5rem)] w-full items-center border-b bg-background">
      <div className="flex h-full min-w-0 flex-1 items-center gap-2 px-4 md:w-[var(--sidebar-width,16rem)]">
        <div className="-ml-2 flex items-center">{navTrigger}</div>
        <Separator orientation="vertical" className="-ml-px h-full" />
        <Link href="/videos" className="flex min-w-0 items-center">
          <Logo />
        </Link>
      </div>
      <div className="flex h-full items-center gap-2 pr-4">
        <GitHubLink />
        <ThemeSwitcher />
        <UserActions user={user} />
      </div>
    </header>
  );
}
