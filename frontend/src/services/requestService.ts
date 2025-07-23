import apiClient from '@/lib/apiClient';
import { TenantRequest, QuotaRequest } from '@/types/request';

export interface ListTenantRequestsResponse {
    data: TenantRequest[];
}

export interface ListQuotaRequestsResponse {
    data: QuotaRequest[];
}

const listTenantRequests = async (): Promise<ListTenantRequestsResponse> => {
    const response = await apiClient.get<ListTenantRequestsResponse>('/sa/requests/tenant');
    return response.data;
};

const listQuotaRequests = async (): Promise<ListQuotaRequestsResponse> => {
    const response = await apiClient.get<ListQuotaRequestsResponse>('/sa/requests/quota');
    return response.data;
};

export const requestService = {
    listTenantRequests,
    listQuotaRequests,
};