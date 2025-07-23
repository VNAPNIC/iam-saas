import apiClient from '@/lib/apiClient';
import { Application } from '@/types/application';

export interface ListApplicationsResponse {
    data: Application[];
}

const listApplications = async (): Promise<ListApplicationsResponse> => {
    const response = await apiClient.get<ListApplicationsResponse>('/protected/applications');
    return response.data;
};

export const applicationService = {
    listApplications,
};