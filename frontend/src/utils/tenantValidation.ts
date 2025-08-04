// Tenant validation utilities

export interface TenantValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates tenant key format
 * Rules: lowercase letters, numbers, hyphens only, 3-50 characters
 */
export function validateTenantKeyFormat(tenantKey: string): TenantValidationResult {
  if (!tenantKey) {
    return { isValid: false, error: 'Tenant key is required' };
  }

  if (tenantKey.length < 3) {
    return { isValid: false, error: 'Tenant key must be at least 3 characters' };
  }

  if (tenantKey.length > 50) {
    return { isValid: false, error: 'Tenant key must be less than 50 characters' };
  }

  if (!/^[a-z0-9-]+$/.test(tenantKey)) {
    return { isValid: false, error: 'Tenant key can only contain lowercase letters, numbers, and hyphens' };
  }

  if (tenantKey.startsWith('-') || tenantKey.endsWith('-')) {
    return { isValid: false, error: 'Tenant key cannot start or end with a hyphen' };
  }

  if (tenantKey.includes('--')) {
    return { isValid: false, error: 'Tenant key cannot contain consecutive hyphens' };
  }

  return { isValid: true };
}

/**
 * Checks if a tenant path is a reserved system route
 */
export function isReservedTenantPath(tenantPath: string): boolean {
  const reservedPaths = [
    'api', 'admin', 'www', 'mail', 'ftp', 'blog', 'shop', 'store',
    'app', 'apps', 'mobile', 'web', 'site', 'portal', 'dashboard',
    'login', 'signup', 'auth', 'oauth', 'sso', 'saml', 'oidc',
    'support', 'help', 'docs', 'documentation', 'guide', 'tutorial',
    'status', 'health', 'ping', 'test', 'demo', 'example', 'sample',
    'dev', 'development', 'staging', 'prod', 'production',
    'cdn', 'assets', 'static', 'media', 'images', 'files',
    'webhooks', 'callback', 'callbacks', 'redirect', 'return'
  ];

  return reservedPaths.includes(tenantPath.toLowerCase());
}

/**
 * Validates tenant key availability (format + not reserved)
 */
export function validateTenantKey(tenantKey: string): TenantValidationResult {
  // First check format
  const formatResult = validateTenantKeyFormat(tenantKey);
  if (!formatResult.isValid) {
    return formatResult;
  }

  // Check if reserved
  if (isReservedTenantPath(tenantKey)) {
    return { isValid: false, error: 'This tenant key is reserved and cannot be used' };
  }

  return { isValid: true };
}

/**
 * Generates tenant key suggestions based on company name
 */
export function generateTenantKeySuggestions(companyName: string): string[] {
  if (!companyName) return [];

  const base = companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  if (!base) return [];

  const suggestions = [base];

  // Add variations
  if (base.length > 10) {
    // Try abbreviation
    const words = base.split('-');
    if (words.length > 1) {
      const abbrev = words.map(word => word.charAt(0)).join('');
      if (abbrev.length >= 3) {
        suggestions.push(abbrev);
      }
    }
  }

  // Add with common suffixes
  suggestions.push(`${base}-corp`);
  suggestions.push(`${base}-inc`);
  suggestions.push(`${base}-co`);

  // Add with numbers
  suggestions.push(`${base}-1`);
  suggestions.push(`${base}-2024`);

  return suggestions
    .filter(suggestion => {
      const validation = validateTenantKey(suggestion);
      return validation.isValid;
    })
    .slice(0, 5); // Return max 5 suggestions
}

import { publicApiClient } from '@/lib/apiClient';

/**
 * Cache for tenant validation results
 */
const tenantValidationCache = new Map<string, { result: boolean; expires: number }>();

/**
 * Validates tenant existence with caching
 */
export async function validateTenantExists(tenantPath: string): Promise<boolean> {
  // Check cache first
  const cached = tenantValidationCache.get(tenantPath);
  if (cached && cached.expires > Date.now()) {
    return cached.result;
  }

  try {
    const response = await publicApiClient.get(`/iam/${tenantPath}/public/config`);
    const exists = response.status === 200 && response.data;
    
    // Cache result for 5 minutes
    tenantValidationCache.set(tenantPath, {
      result: exists,
      expires: Date.now() + 5 * 60 * 1000
    });
    
    return exists;
  } catch {
    return false;
  }
}

/**
 * Clears tenant validation cache
 */
export function clearTenantValidationCache(): void {
  tenantValidationCache.clear();
}