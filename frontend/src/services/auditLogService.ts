import { apiClient } from '@/lib/apiClient';

export interface AuditLog {
    id: string;
    tenantId: number;
    userId: number;
    userEmail: string;
    ipAddress: string;
    event: string;
    status: string;
    severity: string;
    details: string;
    createdAt: string;
}

export interface AuditLogFilters {
    event?: string;
    userId?: string;
    status?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
}

class AuditLogService {
    async getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLog[]> {
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                params.append(key, value);
            }
        });

        const response = await apiClient.get(`/protected/audit-logs?${params.toString()}`);
        return response.data.data;
    }

    async exportAuditLogs(filters: AuditLogFilters = {}): Promise<Blob> {
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                params.append(key, value);
            }
        });

        const response = await apiClient.get(`/protected/audit-logs/export?${params.toString()}`, {
            responseType: 'blob'
        });
        return response.data;
    }
}

export const auditLogService = new AuditLogService();