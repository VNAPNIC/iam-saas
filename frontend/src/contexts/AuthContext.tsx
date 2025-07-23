"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import apiClient, { setTenantKey } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (accessToken: string, refreshToken: string, user: User, isOnboarded: boolean) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, accessToken, refreshToken, login: authStoreLogin, logout: authStoreLogout, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      if (accessToken && user?.tenantKey) {
        setTenantKey(user.tenantKey);
        try {
          const { data } = await apiClient.get('/protected/me'); 
          authStoreLogin(accessToken, refreshToken || '', data.data); // Pass refreshToken as well
        } catch (error) {
          console.error("Invalid token, logging out.");
          authStoreLogout();
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [accessToken, refreshToken, authStoreLogin, authStoreLogout, user]);

  const login = async (newAccessToken: string, newRefreshToken: string, newUser: User, isOnboarded: boolean) => {
    setIsLoading(true);
    authStoreLogin(newAccessToken, newRefreshToken, newUser);
    if (newUser.tenantKey) {
        setTenantKey(newUser.tenantKey);
    }
    try {
        const { data } = await apiClient.get('/protected/me');
        authStoreLogin(newAccessToken, newRefreshToken, data.data);
        if (!isOnboarded) {
            router.push(`/${newUser.tenantKey}/onboarding`);
        } else {
            router.push(`/${newUser.tenantKey}/dashboard`);
        }
    } catch (error) {
        console.error("Failed to fetch user profile after login.", error);
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    authStoreLogout();
    router.push('/login');
  };

  const contextValue = {
    user,
    accessToken,
    refreshToken,
    login,
    logout,
    isAuthenticated,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Tạo custom hook để sử dụng context dễ dàng hơn
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
