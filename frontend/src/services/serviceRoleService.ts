import apiClient from '@/lib/apiClient';
import { ServiceRole } from '@/types/serviceRole';

export interface ListServiceRolesResponse {
    data: ServiceRole[];
}

export interface CreateServiceRoleRequest {
    name: string;
    description?: string;
    permissions: string[];
}

export interface UpdateServiceRoleRequest {
    name?: string;
    description?: string;
    permissions?: string[];
}

class ServiceRoleService {
    async listServiceRoles(): Promise<ServiceRole[]> {
        const response = await apiClient.get('/protected/service-roles');
        return response.data.data;
    }

    async getServiceRole(id: string): Promise<ServiceRole> {
        const response = await apiClient.get(`/protected/service-roles/${id}`);
        return response.data.data;
    }

    async createServiceRole(data: CreateServiceRoleRequest): Promise<ServiceRole> {
        const response = await apiClient.post('/protected/service-roles', data);
        return response.data.data;
    }

    async updateServiceRole(id: string, data: UpdateServiceRoleRequest): Promise<ServiceRole> {
        const response = await apiClient.put(`/protected/service-roles/${id}`, data);
        return response.data.data;
    }

    async deleteServiceRole(id: string): Promise<void> {
        await apiClient.delete(`/protected/service-roles/${id}`);
    }
}

export const serviceRoleService = new ServiceRoleService();