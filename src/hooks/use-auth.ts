'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { useApiClient } from '@/hooks/use-api-client';
import { API } from '@/config/api-endpoints';

interface VerifyResponse {
  valid: boolean;
  token?: string;
  name?: string;
  scope?: 'read-only' | 'full-access';
  error?: string;
}

export function useAuth() {
  const router = useRouter();
  const { post } = useApiClient();
  const { token, tokenName, isAuthenticated, scope, setToken, clearToken } =
    useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (rawToken: string) =>
      post<VerifyResponse>(API.TOKENS_VERIFY, { token: rawToken }),
    onSuccess: (data, rawToken) => {
      if (data.valid) {
        setToken(rawToken, data.name ?? 'API Token', data.scope ?? 'read-only');
        toast.success('Angemeldet', { description: `Token: ${data.name ?? rawToken.slice(0, 12)}…` });
        router.push('/');
      } else {
        toast.error('Ungültiger Token', { description: data.error ?? 'Bitte prüfe dein API-Token.' });
      }
    },
    onError: () => {
      toast.error('Verbindungsfehler', {
        description: 'Backend nicht erreichbar. Prüfe die API-URL.',
      });
    },
  });

  const logout = useCallback(() => {
    clearToken();
    router.push('/login');
    toast.info('Abgemeldet');
  }, [clearToken, router]);

  return {
    token,
    tokenName,
    isAuthenticated,
    scope,
    login: loginMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
  };
}
