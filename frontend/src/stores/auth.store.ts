import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setToken, removeToken } from '@/lib/auth';

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: string;
  accountType?: 'user' | 'customer';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,

      login: (user, token) => {
        setToken(token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        removeToken();
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setToken(state.token);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);
