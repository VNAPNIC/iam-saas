import { NextRequest, NextResponse } from 'next/server';
import { publicApiClient } from '@/lib/apiClient';

// Enhanced middleware với tenant validation và better routing logic
export async function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;
  
  // Helper functions
  const isSystemOneRoute = (path: string): boolean => {
    const systemOneRoutes = [
      '/', '/pricing', '/login', '/signup', '/forgot-password', '/verify-email',
      '/sa', '/tenant', '/onboard', '/api', '/_next', '/favicon.ico'
    ];
    
    return systemOneRoutes.some(route => {
      if (route === '/') return path === '/';
      return path.startsWith(route);
    });
  };
  
  const extractTenantPath = (path: string): string | null => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return null;
    
    const firstSegment = segments[0];
    
    // Skip if it's a system route
    if (isSystemOneRoute('/' + firstSegment)) return null;
    
    // Validate tenant key format (lowercase, numbers, hyphens, 3-50 chars)
    if (!/^[a-z0-9-]{3,50}$/.test(firstSegment)) return null;
    
    return firstSegment;
  };
  
  const validateTenant = async (tenantPath: string): Promise<boolean> => {
    try {
      const response = await publicApiClient.get(`/tenants/by-domain?domain=${tenantPath}`);

      if (response.status === 200) {
        const data = response.data;
        return data.success && data.data && data.data.status === 'active';
      }

      return false;
    } catch (error) {
      console.error('Error validating tenant:', error);
      return false;
    }
  };
  
  // HỆ THỐNG 1: Nền tảng SaaS Lõi (domain.xyz)
  // Dành cho Tenant Admin và Super Admin
  if (isSystemOneRoute(pathname)) {
    // Allow all system one routes to pass through
    return NextResponse.next();
  }
  
  // HỆ THỐNG 2: Dịch vụ IAM của Tenant (domain.xyz/[tenant_domain_path]/)
  const tenantPath = extractTenantPath(pathname);
  
  if (tenantPath) {
    // Validate tenant exists (in production, this would be an async API call)
    const isValidTenant = await validateTenant(tenantPath);
    
    if (!isValidTenant) {
      // Redirect to 404 for invalid tenant paths
      return NextResponse.redirect(new URL('/404', request.url));
    }
    
    // Extract the remaining path after tenant
    const pathSegments = pathname.split('/').filter(Boolean);
    const remainingPath = '/' + pathSegments.slice(1).join('/');
    
    // Handle tenant IAM routes
    const tenantRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'];
    
    if (remainingPath === '/' || tenantRoutes.includes(remainingPath)) {
      // Rewrite to tenant IAM pages
      const targetPath = remainingPath === '/' ? '/login' : remainingPath;
      return NextResponse.rewrite(new URL(`/iam/${tenantPath}${targetPath}`, request.url));
    }
    
    // Handle OAuth2/OIDC endpoints
    if (remainingPath.startsWith('/oauth/') || remainingPath.startsWith('/auth/')) {
      // These are API endpoints, let them pass through to backend
      return NextResponse.next();
    }
    
    // For any other tenant paths, redirect to tenant login
    return NextResponse.redirect(new URL(`/${tenantPath}/login`, request.url));
  }
  
  // If we reach here, it's an unknown route - let Next.js handle it (will likely 404)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};