'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  tenantKey: string;
  roles: string[];
  permissions: string[];
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });
  
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Validate token and get user info
      const userInfo = await authService.getCurrentUser();
      setAuthState({
        user: userInfo,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: 'Authentication failed',
      });
    }
  };

  const login = async (email: string, password: string, mfaOtp?: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authService.login(email, password, mfaOtp);
      
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      // Get user info after login
      const userInfo = await authService.getCurrentUser();
      
      setAuthState({
        user: userInfo,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      return response;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed',
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
      router.push('/login');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await authService.register(name, email, password);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return response;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Registration failed',
      }));
      throw error;
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!authState.user) return false;
    return authState.user.permissions.includes(permission) || 
           authState.user.permissions.includes('super_admin');
  };

  const hasRole = (role: string): boolean => {
    if (!authState.user) return false;
    return authState.user.roles.includes(role);
  };

  const isSuperAdmin = (): boolean => {
    return hasPermission('super_admin');
  };

  const isTenantAdmin = (): boolean => {
    return hasPermission('users:create') && hasPermission('users:delete');
  };

  return {
    ...authState,
    login,
    logout,
    register,
    hasPermission,
    hasRole,
    isSuperAdmin,
    isTenantAdmin,
    checkAuthStatus,
  };
};