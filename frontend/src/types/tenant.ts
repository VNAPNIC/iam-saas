export interface Tenant {
    id: string;
    planId: string;
    domain: string;
    domainVerified: boolean;
    name: string;
    status: string;
    userQuota: number;
    logoUrl?: string;
    primaryColor?: string;
    allowPublicSignup: boolean;
    isOnboarded: boolean;
    createdAt: string;
    updatedAt: string;
    emailProvider: string;
    emailConfig: Record<string, any>;
    passwordPolicy: Record<string, any>;
}

export interface TenantConfig {
  id: number;
  name: string;
  key: string;
  domain: string;
  logoURL?: string;
  primaryColor?: string;
  allowPublicSignup: boolean;
  ssoEnabled: boolean;
  mfaRequired: boolean;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  status: 'active' | 'suspended' | 'pending';
}

export interface TenantBranding {
  logoURL?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customCSS?: string;
}

export interface TenantPolicies {
  allowPublicSignup: boolean;
  mfaRequired: boolean;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  sessionTimeout: number;
  maxLoginAttempts: number;
}