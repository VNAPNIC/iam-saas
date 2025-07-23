import apiClient from '@/lib/apiClient';
import { Session } from '@/types/session';

export interface ListSessionsResponse {
    data: Session[];
}

const listSessions = async (): Promise<ListSessionsResponse> => {
    const response = await apiClient.get<ListSessionsResponse>('/protected/sessions');
    return response.data;
};

export const sessionService = {
    listSessions,
};