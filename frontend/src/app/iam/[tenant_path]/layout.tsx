// This layout is only for dashboard pages, NOT for auth pages
// Auth pages use their own layout in (auth)/layout.tsx
export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // For auth pages, just pass through children without dashboard layout
  return <>{children}</>;
}
