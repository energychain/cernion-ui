import axios, { type InternalAxiosRequestConfig } from 'axios';
import { LS_TOKEN_KEY } from '@/lib/constants';

// Augment axios config type to carry start timestamp
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: { startTime: number };
  }
}

const apiClient = axios.create({
  // Empty baseURL → relative paths → Next.js rewrites proxy to backend
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: inject Bearer token + record start time ─────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem(LS_TOKEN_KEY) : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.metadata = { startTime: Date.now() };
  return config;
});

// ── Response: API-inspector logging + 401 redirect ───────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    if (typeof window !== 'undefined') {
      // Lazy-import to avoid circular deps at module load time
      import('@/stores/api-log-store').then(({ useApiLogStore }) => {
        useApiLogStore.getState().addEntry({
          method: response.config.method?.toUpperCase() ?? 'GET',
          url: response.config.url ?? '',
          status: response.status,
          latencyMs: Date.now() - (response.config.metadata?.startTime ?? Date.now()),
          timestamp: new Date().toISOString(),
        });
      });
    }
    return response;
  },
  (error) => {
    if (typeof window !== 'undefined') {
      import('@/stores/api-log-store').then(({ useApiLogStore }) => {
        useApiLogStore.getState().addEntry({
          method: error.config?.method?.toUpperCase() ?? 'GET',
          url: error.config?.url ?? '',
          status: error.response?.status ?? 0,
          latencyMs: Date.now() - (error.config?.metadata?.startTime ?? Date.now()),
          timestamp: new Date().toISOString(),
        });
      });

      if (error.response?.status === 401) {
        localStorage.removeItem(LS_TOKEN_KEY);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
