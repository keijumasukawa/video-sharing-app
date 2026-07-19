import { Header } from "@/components/layout/header";
import { OverlaySidebar } from "@/components/layout/overlay-sidebar";

export default function PlayerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header navTrigger={<OverlaySidebar />} />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
