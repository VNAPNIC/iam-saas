import { apiClient } from '@/lib/apiClient';

export interface SupportTicket {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    category: 'technical' | 'billing' | 'general' | 'feature_request';
    userId: string;
    userEmail: string;
    assignedTo?: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
}

export interface TicketReply {
    id: string;
    ticketId: string;
    userId: string;
    userEmail: string;
    message: string;
    isInternal: boolean;
    createdAt: string;
}

export interface CreateTicketRequest {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'technical' | 'billing' | 'general' | 'feature_request';
    attachments?: File[];
}

export interface ReplyTicketRequest {
    message: string;
    isInternal?: boolean;
    attachments?: File[];
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
    isPublished: boolean;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
}

class SupportService {
    // Ticket Management
    async getTickets(): Promise<SupportTicket[]> {
        const response = await apiClient.get('/protected/tickets');
        return response.data.data;
    }

    async getTicket(id: string): Promise<SupportTicket> {
        const response = await apiClient.get(`/protected/tickets/${id}`);
        return response.data.data;
    }

    async createTicket(data: CreateTicketRequest): Promise<SupportTicket> {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('priority', data.priority);
        formData.append('category', data.category);
        
        if (data.attachments) {
            data.attachments.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);
            });
        }

        const response = await apiClient.post('/protected/tickets', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data;
    }

    async updateTicketStatus(id: string, status: SupportTicket['status']): Promise<SupportTicket> {
        const response = await apiClient.put(`/protected/tickets/${id}/status`, { status });
        return response.data.data;
    }

    async replyToTicket(ticketId: string, data: ReplyTicketRequest): Promise<TicketReply> {
        const formData = new FormData();
        formData.append('message', data.message);
        if (data.isInternal !== undefined) {
            formData.append('isInternal', data.isInternal.toString());
        }
        
        if (data.attachments) {
            data.attachments.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);
            });
        }

        const response = await apiClient.post(`/protected/tickets/${ticketId}/replies`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data;
    }

    async getTicketReplies(ticketId: string): Promise<TicketReply[]> {
        const response = await apiClient.get(`/protected/tickets/${ticketId}/replies`);
        return response.data.data;
    }

    // FAQ Management
    async getFAQs(): Promise<FAQ[]> {
        const response = await apiClient.get('/public/faqs');
        return response.data.data;
    }

    async searchFAQs(query: string): Promise<FAQ[]> {
        const response = await apiClient.get(`/public/faqs/search?q=${encodeURIComponent(query)}`);
        return response.data.data;
    }

    // Knowledge Base
    async getDocumentation(): Promise<Array<{ title: string; url: string; category: string }>> {
        const response = await apiClient.get('/public/documentation');
        return response.data.data;
    }

    // Contact Support
    async getContactInfo(): Promise<{ email: string; phone?: string; hours: string }> {
        const response = await apiClient.get('/public/contact');
        return response.data.data;
    }
}

export const supportService = new SupportService();