import apiClient from '../lib/apiClient';

export interface InviteUserPayload {
  name: string;
  email: string;
  role: string; // Backend có thể cần xử lý việc gán vai trò này
}

const invite = async (payload: InviteUserPayload) => {
  try {
    // Endpoint này là một API được bảo vệ
    const response = await apiClient.post('/protected/users/invite', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getUsers = async () => {
  try {
    const response = await apiClient.get('/protected/users');
    return response.data.data; // API trả về { data: users, ... }
  } catch (error) {
    throw error;
  }
};

const updateUser = async (userId: number, payload: any) => {
  try {
    const response = await apiClient.put(`/protected/users/${userId}`, payload);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

const deleteUser = async (userId: number) => {
  try {
    await apiClient.delete(`/protected/users/${userId}`);
  } catch (error) {
    throw error;
  }
};

export const userService = {
  invite,
  getUsers,
  updateUser,
  deleteUser,
};
