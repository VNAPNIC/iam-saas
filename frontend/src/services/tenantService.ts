import apiClient from '@/lib/apiClient';
import { Tenant } from '@/types/tenant';

export interface ListTenantsResponse {
    data: Tenant[];
    // Add pagination info later
}

export interface CreateTenantRequest {
    name: string;
    domain: string;
}

export interface UpdateEmailSettingsRequest {
    provider: string;
    config: Record<string, any>;
}

export interface UpdatePasswordPolicyRequest {
    policy: Record<string, any>;
}

export interface UpdateDomainRequest {
    domain: string;
}

export interface VerifyDomainRequest {
    method: string; // "dns" or "file"
}

const listTenants = async (): Promise<ListTenantsResponse> => {
    const response = await apiClient.get<ListTenantsResponse>('/sa/tenants');
    return response.data;
};

const createTenant = async (data: CreateTenantRequest): Promise<{ data: Tenant }> => {
    const response = await apiClient.post<{ data: Tenant }>('/sa/tenants', data);
    return response.data;
};

const getTenantDetails = async (tenantId: string): Promise<{ data: Tenant }> => {
    const response = await apiClient.get<{ data: Tenant }>(`/sa/tenants/${tenantId}`);
    return response.data;
};

const updateEmailSettings = async (tenantId: string, data: UpdateEmailSettingsRequest): Promise<{ data: Tenant }> => {
    const response = await apiClient.put<{ data: Tenant }>(`/protected/tenant/email-settings`, data);
    return response.data;
};

const updatePasswordPolicy = async (tenantId: string, data: UpdatePasswordPolicyRequest): Promise<{ data: Tenant }> => {
    const response = await apiClient.put<{ data: Tenant }>(`/protected/tenant/password-policy`, data);
    return response.data;
};

const updateDomain = async (tenantId: string, data: UpdateDomainRequest): Promise<{ data: Tenant }> => {
    const response = await apiClient.put<{ data: Tenant }>(`/protected/tenant/domain`, data);
    return response.data;
};

const verifyDomain = async (tenantId: string, data: VerifyDomainRequest): Promise<{ data: Tenant }> => {
    const response = await apiClient.post<{ data: Tenant }>(`/protected/tenant/domain/verify`, data);
    return response.data;
};

const getTenantByDomain = async (domain: string): Promise<{ data: Tenant }> => {
    const response = await apiClient.get<{ data: Tenant }>(`/public/tenants/by-domain?domain=${domain}`);
    return response.data;
};

const getTenantBranding = async (domain: string): Promise<{ data: any }> => {
    const response = await apiClient.get<{ data: any }>(`/public/tenants/${domain}/branding`);
    return response.data;
};

const updateTenantBranding = async (tenantId: string, branding: any): Promise<{ data: Tenant }> => {
    const response = await apiClient.put<{ data: Tenant }>(`/tenants/${tenantId}/branding`, branding);
    return response.data;
};

export const tenantService = {
    listTenants,
    createTenant,
    getTenantDetails,
    updateEmailSettings,
    updatePasswordPolicy,
    updateDomain,
    verifyDomain,
    getTenantByDomain,
    getTenantBranding,
    updateTenantBranding,
};