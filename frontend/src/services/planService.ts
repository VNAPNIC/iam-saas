import apiClient from '@/lib/apiClient';
import { Plan } from '@/types/plan';

export interface ListPlansResponse {
    data: Plan[];
    // Add pagination info later
}

const listPlans = async (): Promise<ListPlansResponse> => {
    const response = await apiClient.get<ListPlansResponse>('/sa/plans');
    return response.data;
};

export const planService = {
    listPlans,
};