import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LS_TOKEN_KEY, LS_TOKEN_NAME_KEY } from '@/lib/constants';

interface AuthState {
  token: string | null;
  tokenName: string | null;
  isAuthenticated: boolean;
  scope: 'read-only' | 'full-access' | null;
  setToken: (token: string, name: string, scope?: 'read-only' | 'full-access') => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      tokenName: null,
      isAuthenticated: false,
      scope: null,
      setToken: (token, name, scope = 'read-only') => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(LS_TOKEN_KEY, token);
          localStorage.setItem(LS_TOKEN_NAME_KEY, name);
        }
        set({ token, tokenName: name, isAuthenticated: true, scope });
      },
      clearToken: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(LS_TOKEN_KEY);
          localStorage.removeItem(LS_TOKEN_NAME_KEY);
        }
        set({ token: null, tokenName: null, isAuthenticated: false, scope: null });
      },
    }),
    {
      name: 'cernion-auth',
      partialize: (state) => ({
        token: state.token,
        tokenName: state.tokenName,
        isAuthenticated: state.isAuthenticated,
        scope: state.scope,
      }),
    }
  )
);
