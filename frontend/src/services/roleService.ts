import apiClient from '@/lib/apiClient';
import { Role } from '@/types/role';
import { Permission } from '@/types/permission';

export interface ListRolesResponse {
    data: Role[];
    // Add pagination info later
}

const listRoles = async (): Promise<ListRolesResponse> => {
    const response = await apiClient.get<ListRolesResponse>('/protected/roles');
    return response.data;
};

const getPermissions = async (): Promise<Permission[]> => {
    const response = await apiClient.get<Permission[]>('/protected/permissions');
    return response.data;
};

const createRole = async (tenantKey: string, payload: any): Promise<Role> => {
    const response = await apiClient.post<Role>(`/protected/roles`, payload);
    return response.data;
};

const updateRole = async (tenantKey: string, roleId: string, payload: any): Promise<Role> => {
    const response = await apiClient.put<Role>(`/protected/roles/${roleId}`, payload);
    return response.data;
};

export const roleService = {
    listRoles,
    getPermissions,
    createRole,
    updateRole,
};