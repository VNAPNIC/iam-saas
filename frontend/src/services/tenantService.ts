import apiClient from '@/lib/apiClient';
import { Tenant } from '@/types/tenant';

export interface ListTenantsResponse {
    data: Tenant[];
    // Add pagination info later
}

const listTenants = async (): Promise<ListTenantsResponse> => {
    const response = await apiClient.get<ListTenantsResponse>('/sa/tenants');
    return response.data;
};

const getTenantDetails = async (tenantId: string): Promise<{ data: Tenant }> => {
    const response = await apiClient.get<{ data: Tenant }>(`/sa/tenants/${tenantId}`);
    return response.data;
};

export const tenantService = {
    listTenants,
    getTenantDetails,
};