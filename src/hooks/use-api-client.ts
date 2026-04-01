'use client';

import { useCallback } from 'react';
import apiClient from '@/lib/api-client';
import type { AxiosRequestConfig } from 'axios';

/**
 * Returns a thin wrapper around the Axios apiClient.
 * Components always import this hook so all calls go through the
 * configured interceptors (auth injection, API-log, 401 redirect).
 */
export function useApiClient() {
  const get = useCallback(
    <T = unknown>(url: string, config?: AxiosRequestConfig) =>
      apiClient.get<T>(url, config).then((r) => r.data),
    []
  );

  const post = useCallback(
    <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
      apiClient.post<T>(url, data, config).then((r) => r.data),
    []
  );

  const put = useCallback(
    <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
      apiClient.put<T>(url, data, config).then((r) => r.data),
    []
  );

  const del = useCallback(
    <T = unknown>(url: string, config?: AxiosRequestConfig) =>
      apiClient.delete<T>(url, config).then((r) => r.data),
    []
  );

  return { get, post, put, del, client: apiClient };
}
