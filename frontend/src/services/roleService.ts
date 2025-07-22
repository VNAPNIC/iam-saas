import apiClient from '../lib/apiClient';

export const roleService = {
  // Lấy danh sách tất cả các vai trò
  async getRoles() {
    const response = await apiClient.get('/protected/roles');
    return response.data.data;
  },

  // Lấy danh sách tất cả các quyền có thể gán
  async getPermissions() {
    const response = await apiClient.get('/protected/permissions');
    return response.data.data;
  },

  // Tạo một vai trò mới
  async createRole(payload: any) {
    const response = await apiClient.post('/protected/roles', payload);
    return response.data.data;
  },

  // Cập nhật một vai trò
  async updateRole(roleId: number, payload: any) {
    const response = await apiClient.put(`/protected/roles/${roleId}`, payload);
    return response.data.data;
  },

  // Xóa một vai trò
  async deleteRole(roleId: number) {
    await apiClient.delete(`/protected/roles/${roleId}`);
  },
};
