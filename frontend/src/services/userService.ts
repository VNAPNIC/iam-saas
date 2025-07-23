import apiClient from '@/lib/apiClient';
import { User } from '@/types/user';

export interface ListUsersResponse {
    data: User[];
    // Add pagination info later
}

export interface InviteUserPayload {
    name: string;
    email: string;
    role: string;
}

const listUsers = async (): Promise<ListUsersResponse> => {
    const response = await apiClient.get<ListUsersResponse>('/protected/users');
    return response.data;
};

const updateProfile = async (tenantKey: string, profile: Partial<User>): Promise<void> => {
    await apiClient.put(`/protected/me`, profile);
};

const changePassword = async (tenantKey: string, passwordData: any): Promise<void> => {
    await apiClient.put(`/protected/me/password`, passwordData);
};

const updateTenantBranding = async (tenantKey: string, brandingData: any): Promise<void> => {
    await apiClient.put(`/protected/tenant/branding`, brandingData);
};

const invite = async (tenantKey: string, payload: InviteUserPayload): Promise<User> => {
    const response = await apiClient.post<User>(`/protected/users/invite`, payload);
    return response.data;
};

const updateUser = async (tenantKey: string, userId: string, userData: Partial<User>): Promise<User> => {
    const response = await apiClient.put<User>(`/protected/users/${userId}`, userData);
    return response.data;
};

export const userService = {
    listUsers,
    updateProfile,
    changePassword,
    updateTenantBranding,
    invite,
    updateUser,
};