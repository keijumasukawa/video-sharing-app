import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

interface AppHeaderProps {
  trigger: React.ReactNode;
}

export function AppHeader({ trigger }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
      {trigger}
      <Link href="/videos" className="font-semibold">
        video-sharing-app
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
