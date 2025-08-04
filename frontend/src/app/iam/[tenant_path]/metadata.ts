import { Metadata } from 'next';

// Generate metadata dynamically based on tenant
export async function generateMetadata({ params }: { params: Promise<{ tenant_path: string }> }): Promise<Metadata> {
  const { tenant_path } = await params;
  const tenantPath = tenant_path;
  
  // In production, this would fetch tenant config for SEO
  // For now, return basic metadata
  return {
    title: `${tenantPath.charAt(0).toUpperCase() + tenantPath.slice(1)} - Sign In`,
    description: `Sign in to your ${tenantPath} account`,
    robots: 'noindex, nofollow', // Prevent indexing of tenant login pages
  };
}