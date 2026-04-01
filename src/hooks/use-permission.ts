'use client';

import { useAuthStore } from '@/stores/auth-store';

/**
 * Returns whether the current user has the required scope.
 * 'full-access' implies all 'read-only' permissions.
 */
export function usePermission(required: 'read-only' | 'full-access'): boolean {
  const scope = useAuthStore((s) => s.scope);
  if (!scope) return false;
  if (required === 'read-only') return true; // any authenticated user
  return scope === 'full-access';
}
