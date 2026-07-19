import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
  navTrigger: React.ReactNode;
}

export function Header({ navTrigger }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-[var(--header-height,3.5rem)] w-full items-center border-b bg-background">
      <div className="flex h-full flex-1 shrink-0 items-center gap-2 px-4 md:w-[var(--sidebar-width,16rem)]">
        {navTrigger}
        <Separator orientation="vertical" className="-ml-px h-full" />
        <Link href="/videos">
          <Logo />
        </Link>
      </div>
      <div className="flex h-full items-center gap-2 pr-4">
        <ThemeSwitcher />
      </div>
    </header>
  );
}
