import { apiClient } from '@/lib/apiClient';

export interface SCIMConfig {
    baseUrl: string;
    apiToken: string;
    enabled: boolean;
}

export interface SIEMConfig {
    endpointUrl: string;
    authHeader: string;
    enabled: boolean;
    format: string;
}

export interface Integration {
    id: string;
    tenantId: number;
    type: string;
    name: string;
    status: string;
    config: string;
    createdAt: string;
    updatedAt: string;
}

class IntegrationService {
    // SCIM operations
    async getSCIMSettings(): Promise<SCIMConfig> {
        const response = await apiClient.get('/protected/scim/settings');
        return response.data.data;
    }

    async updateSCIMSettings(config: SCIMConfig): Promise<void> {
        await apiClient.put('/protected/scim/settings', config);
    }

    async generateSCIMToken(): Promise<string> {
        const response = await apiClient.post('/protected/scim/token/generate');
        return response.data.data.token;
    }

    // SIEM operations
    async getSIEMSettings(): Promise<SIEMConfig> {
        const response = await apiClient.get('/protected/siem/settings');
        return response.data.data;
    }

    async updateSIEMSettings(config: SIEMConfig): Promise<void> {
        await apiClient.put('/protected/siem/settings', config);
    }

    async testSIEMConnection(config: SIEMConfig): Promise<{ status: string; message: string }> {
        const response = await apiClient.post('/protected/siem/test', config);
        return response.data.data;
    }

    // General integration operations
    async listIntegrations(): Promise<Integration[]> {
        const response = await apiClient.get('/protected/integrations');
        return response.data.data;
    }

    async getIntegration(type: string): Promise<Integration> {
        const response = await apiClient.get(`/protected/integrations/${type}`);
        return response.data.data;
    }

    async updateIntegrationStatus(type: string, status: string): Promise<void> {
        await apiClient.put(`/protected/integrations/${type}/status`, { status });
    }
}

export const integrationService = new IntegrationService();