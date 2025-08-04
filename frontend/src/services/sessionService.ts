import apiClient from '@/lib/apiClient';
import { Session } from '@/types/session';

export interface ListSessionsResponse {
    data: Session[];
}

export interface SessionFilters {
    userEmail?: string;
    ipAddress?: string;
    os?: string;
    browser?: string;
}

class SessionService {
    async listSessions(filters?: SessionFilters): Promise<Session[]> {
        const params = new URLSearchParams();
        if (filters?.userEmail) params.append('userEmail', filters.userEmail);
        if (filters?.ipAddress) params.append('ipAddress', filters.ipAddress);
        if (filters?.os) params.append('os', filters.os);
        if (filters?.browser) params.append('browser', filters.browser);

        const response = await apiClient.get(`/protected/sessions?${params.toString()}`);
        return response.data.data;
    }

    async getSession(sessionId: string): Promise<Session> {
        const response = await apiClient.get(`/protected/sessions/${sessionId}`);
        return response.data.data;
    }

    async revokeSession(sessionId: string): Promise<void> {
        await apiClient.delete(`/protected/sessions/${sessionId}`);
    }

    async revokeAllSessions(): Promise<void> {
        await apiClient.delete('/protected/sessions');
    }

    async revokeUserSessions(userEmail: string): Promise<void> {
        await apiClient.delete(`/protected/sessions/user/${encodeURIComponent(userEmail)}`);
    }
}

export const sessionService = new SessionService();