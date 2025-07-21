import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const storeName = 'auth-storage';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token, user) => {
        set({
          isAuthenticated: true,
          token,
          user,
        });
      },
      logout: () => {
        set({
          isAuthenticated: false,
          token: null,
          user: null,
        });
        localStorage.removeItem(storeName);
      },
    }),
    {
      name: storeName,
      storage: createJSONStorage(() => localStorage),
    }
  )
);