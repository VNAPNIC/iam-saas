import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { TenantBrandingProvider } from "@/components/tenant/TenantBrandingProvider";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant_path: string }>;
}) {
  const { tenant_path } = await params;
  
  return (
    <TenantBrandingProvider>
      <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
        <Sidebar tenantKey={tenant_path} />
        
        <div id="content-area" className="content-area flex-1 flex flex-col overflow-hidden">
          <Header tenantPath={tenant_path} />
          
          <main id="main-content" className="flex-1 overflow-y-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </TenantBrandingProvider>
  );
}