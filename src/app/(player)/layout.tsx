import { AppHeader } from "@/components/layout/app-header";
import { NavDrawer } from "@/components/layout/nav-drawer";

export default function PlayerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader trigger={<NavDrawer />} />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
