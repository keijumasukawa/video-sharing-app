import { Header } from "@/components/layout/header";
import { OverlaySidebar } from "@/components/layout/overlay-sidebar";
import { getAuthUser } from "@/lib/auth";

export default async function PlayerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthUser();

  return (
    <div className="flex min-h-svh flex-col">
      <Header navTrigger={<OverlaySidebar />} user={user} />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
