import { apiClient } from '@/lib/apiClient';

export interface Alert {
    id: string;
    tenantId?: number;
    userId?: number;
    type: string;
    event: string;
    message: string;
    description?: string;
    severity: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface AlertFilters {
    severity?: string;
    status?: string;
    tenantId?: string;
    userId?: string;
}

class AlertService {
    async getAlerts(filters: AlertFilters = {}): Promise<Alert[]> {
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                params.append(key, value);
            }
        });

        const response = await apiClient.get(`/sa/alerts?${params.toString()}`);
        return response.data.data;
    }

    async getAlertById(id: string): Promise<Alert> {
        const response = await apiClient.get(`/sa/alerts/${id}`);
        return response.data.data;
    }

    async updateAlertStatus(id: string, status: string): Promise<Alert> {
        const response = await apiClient.put(`/sa/alerts/${id}/status`, { status });
        return response.data.data;
    }

    async deleteAlert(id: string): Promise<void> {
        await apiClient.delete(`/sa/alerts/${id}`);
    }

    async createAlert(alert: Partial<Alert>): Promise<Alert> {
        const response = await apiClient.post('/sa/alerts', alert);
        return response.data.data;
    }
}

export const alertService = new AlertService();