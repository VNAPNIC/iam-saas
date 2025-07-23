import apiClient from '@/lib/apiClient';
import { Policy } from '@/types/policy';

export interface ListPoliciesResponse {
    data: Policy[];
}

const listPolicies = async (): Promise<ListPoliciesResponse> => {
    const response = await apiClient.get<ListPoliciesResponse>('/protected/policies');
    return response.data;
};

const simulate = async (payload: any): Promise<any> => {
    const response = await apiClient.post('/protected/policies/simulate', payload);
    return response.data;
};

export const policyService = {
    listPolicies,
    simulate,
};