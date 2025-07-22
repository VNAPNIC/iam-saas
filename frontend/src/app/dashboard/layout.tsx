import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div>
        {/* Sidebar - sử dụng class 'sidebar' */}
        <Sidebar />
        {/* Container cho header và content */}
        <div className="lg:pl-72">
          {/* Header - sử dụng class 'header' */}
          <Header />
          {/* Main content area - sử dụng class 'main-content' */}
          <main className="main-content">
            <div>{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}