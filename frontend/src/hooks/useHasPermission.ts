import { useAuthStore } from '@/stores/authStore';

export const useHasPermission = (requiredPermissions: string[]) => {
  const { permissions } = useAuthStore();

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  return requiredPermissions.every(permission => permissions.includes(permission));
};
