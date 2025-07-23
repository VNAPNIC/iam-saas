import apiClient from '@/lib/apiClient';
import { AccessKeyGroup } from '@/types/accessKey';

export interface ListAccessKeyGroupsResponse {
    data: AccessKeyGroup[];
}

const listAccessKeyGroups = async (): Promise<ListAccessKeyGroupsResponse> => {
    const response = await apiClient.get<ListAccessKeyGroupsResponse>('/protected/access-keys');
    return response.data;
};

export const accessKeyService = {
    listAccessKeyGroups,
};