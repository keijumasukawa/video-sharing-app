import { DockedSidebar } from "@/components/layout/docked-sidebar";
import { Header } from "@/components/layout/header";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <Header navTrigger={<SidebarTrigger className="-ml-2 size-8" />} />
        <div className="flex flex-1">
          <DockedSidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]!" />
          <SidebarInset>
            <div className="flex flex-1 flex-col">{children}</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
