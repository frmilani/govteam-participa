import { Sidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { requireAuth } from "@/lib/auth-helpers";
import { SidebarProvider } from "@/components/providers/sidebar-context";
import { ToastProvider } from "@/components/ui/Toast";
import { UnitProvider } from "@/contexts/UnitContext";
import { fetchMyUnits } from "@/lib/hub-permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const userId = (session.user as any)?.id;
  const organizationId = (session.user as any)?.organizationId;

  const myUnits = userId && organizationId
    ? await fetchMyUnits(userId, organizationId)
    : null;

  return (
    <UnitProvider units={myUnits?.units || []} hasGlobalAccess={myUnits?.hasGlobalAccess ?? false}>
      <ToastProvider>
        <SidebarProvider>
          <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* Header */}
              <AdminHeader />

              {/* Scrollable Area */}
              <main className="flex-1 overflow-y-auto px-container-desktop py-component-lg custom-scrollbar relative">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </ToastProvider>
    </UnitProvider>
  );
}
