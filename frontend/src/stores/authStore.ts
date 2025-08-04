import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  permissions: string[];
  login: (accessToken: string, refreshToken: string, user: User, permissions: string[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      permissions: [],
      login: (accessToken, refreshToken, user, permissions) => set({ user, accessToken, refreshToken, isAuthenticated: true, permissions }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, permissions: [] })
    }),
    { name: 'auth-storage' }
  )
);