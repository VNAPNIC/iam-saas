"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

// Định nghĩa kiểu dữ liệu cho User và Context
interface User {
  id: number;
  name: string;
  email: string;
  tenantId: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean; // Thêm trạng thái loading để xử lý lần tải đầu tiên
}

// Tạo Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tạo Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          // Nếu có token, xác thực nó với backend để lấy thông tin user
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          // Giả sử có một endpoint /me để lấy thông tin user
          const { data } = await apiClient.get('/protected/me'); 
          setUser(data.data);
          setToken(storedToken);
        } catch (error) {
          // Token không hợp lệ, xóa nó đi
          console.error("Invalid token, logging out.");
          localStorage.removeItem('authToken');
          apiClient.defaults.headers.common['Authorization'] = null;
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (newToken: string) => {
    setIsLoading(true);
    localStorage.setItem('authToken', newToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    try {
        // Lấy thông tin user sau khi login thành công
        const { data } = await apiClient.get('/protected/me');
        setUser(data.data);
        setToken(newToken);
        router.push('/dashboard');
    } catch (error) {
        console.error("Failed to fetch user profile after login.", error);
        // Xử lý lỗi nếu không lấy được profile
        localStorage.removeItem('authToken');
        apiClient.defaults.headers.common['Authorization'] = null;
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    apiClient.defaults.headers.common['Authorization'] = null;
    router.push('/login');
  };

  const contextValue = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
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
