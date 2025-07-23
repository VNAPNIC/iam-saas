import apiClient from '@/lib/apiClient';
import { Webhook } from '@/types/webhook';

export interface ListWebhooksResponse {
    data: Webhook[];
}

const listWebhooks = async (): Promise<ListWebhooksResponse> => {
    const response = await apiClient.get<ListWebhooksResponse>('/protected/webhooks');
    return response.data;
};

export const webhookService = {
    listWebhooks,
};