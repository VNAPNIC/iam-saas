import apiClient from '@/lib/apiClient';
import { ServiceRole } from '@/types/serviceRole';

export interface ListServiceRolesResponse {
    data: ServiceRole[];
}

const listServiceRoles = async (): Promise<ListServiceRolesResponse> => {
    const response = await apiClient.get<ListServiceRolesResponse>('/protected/service-roles');
    return response.data;
};

export const serviceRoleService = {
    listServiceRoles,
};