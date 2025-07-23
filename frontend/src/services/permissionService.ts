import apiClient from '@/lib/apiClient';
import { Permission } from '@/types/permission';

export interface ListPermissionsResponse {
    data: Permission[];
    // Add pagination info later
}

const listPermissions = async (): Promise<ListPermissionsResponse> => {
    const response = await apiClient.get<ListPermissionsResponse>('/protected/permissions');
    return response.data;
};

export const permissionService = {
    listPermissions,
};