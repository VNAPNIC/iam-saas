import apiClient from '@/lib/apiClient';

export interface SsoConfig {
    id: string;
    tenantId: string;
    provider: 'SAML' | 'OIDC' | 'OAuth2';
    metadataUrl: string;
    clientId: string;
    status: 'enabled' | 'disabled';
    createdAt: string;
    updatedAt: string;
}

export interface UpdateSsoConfigRequest {
    provider: 'SAML' | 'OIDC' | 'OAuth2';
    metadataUrl: string;
    clientId: string;
    clientSecret: string;
    enabled: boolean;
}

export interface SsoHistoryEntry {
    id: string;
    action: string;
    performedBy: string;
    timestamp: string;
    details: string;
}

export interface SsoConnectionTestResult {
    success: boolean;
    message: string;
    details?: any;
}

class SsoService {
    async getSsoConfig(): Promise<SsoConfig | null> {
        try {
            const response = await apiClient.get('/protected/sso-settings');
            return response.data.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }

    async updateSsoConfig(data: UpdateSsoConfigRequest): Promise<SsoConfig> {
        const response = await apiClient.put('/protected/sso-settings', data);
        return response.data.data;
    }

    async deleteSsoConfig(): Promise<void> {
        await apiClient.delete('/protected/sso-settings');
    }

    async testSsoConnection(): Promise<SsoConnectionTestResult> {
        const response = await apiClient.post('/protected/sso-settings/test');
        return response.data.data;
    }

    async getSsoHistory(): Promise<SsoHistoryEntry[]> {
        const response = await apiClient.get('/protected/sso-settings/history');
        return response.data.data;
    }

    async exportSsoHistory(): Promise<Blob> {
        const response = await apiClient.get('/protected/sso-settings/history/export', {
            responseType: 'blob'
        });
        return response.data;
    }
}

export const ssoService = new SsoService();