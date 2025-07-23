export interface TenantRequest {
    id: string;
    tenantName: string;
    plan: string;
    adminEmail: string;
    requestDate: string;
}

export interface QuotaRequest {
    id: string;
    tenantName: string;
    quotaType: string;
    requestedAmount: number;
    reason: string;
}