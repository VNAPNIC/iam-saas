"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types/user';


interface LoginResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
  isOnboarded: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (loginData: LoginResponseData) => Promise<void>;
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
        try {
          const { data } = await apiClient.get('/protected/me');
          authStoreLogin(accessToken, refreshToken || '', data.data);
        } catch (error) {
          console.error("Invalid token, logging out.");
          authStoreLogout();
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [accessToken, refreshToken, authStoreLogin, authStoreLogout]);

  const login = async (loginData: LoginResponseData) => {
    setIsLoading(true);

    const { user, accessToken, refreshToken, isOnboarded } = loginData;
    const keyForRedirect = user.tenantKey;

    if (!keyForRedirect) {
      console.error("Login Error: `tenantKey` is missing from server response.");
      authStoreLogout();
      setIsLoading(false);
      return;
    }

    authStoreLogin(accessToken, refreshToken, user);

    if (!isOnboarded) {
      router.push(`/${keyForRedirect}/onboarding`);
    } else {
      router.push(`/${keyForRedirect}/dashboard`);
    }

    setIsLoading(false);
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
