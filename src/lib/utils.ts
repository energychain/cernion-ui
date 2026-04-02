import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import type { Severity, DecisionStatus, ValidationFieldError } from '@/types/ui';
import axios from 'axios';

// ── Tailwind class merge helper ──────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Null / undefined display ──────────────────────────────────────────────────
export function displayValue(
  value: string | number | null | undefined,
  fallback = '–'
): string {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

// ── Number formatting ─────────────────────────────────────────────────────────
export function formatNumber(
  value: number | null | undefined,
  options?: Intl.NumberFormatOptions
): string {
  if (value === null || value === undefined) return '–';
  return new Intl.NumberFormat('de-DE', {
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

export function formatCapacity(kw: number | null | undefined): string {
  if (kw === null || kw === undefined) return '–';
  if (kw >= 1000) return `${formatNumber(kw / 1000, { maximumFractionDigits: 2 })} MW`;
  return `${formatNumber(kw)} kW`;
}

export function formatPercent(
  value: number | null | undefined,
  decimals = 1
): string {
  if (value === null || value === undefined) return '–';
  return `${value.toFixed(decimals)} %`;
}

export function formatCurrency(
  value: number | null | undefined,
  currency = 'EUR'
): string {
  if (value === null || value === undefined) return '–';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatEnergyPrice(centPerKwh: number | null | undefined): string {
  if (centPerKwh === null || centPerKwh === undefined) return '–';
  return `${formatNumber(centPerKwh, { maximumFractionDigits: 2 })} ct/kWh`;
}

// ── Date formatting ───────────────────────────────────────────────────────────
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '–';
  try {
    return format(parseISO(iso), 'dd.MM.yyyy', { locale: de });
  } catch {
    return '–';
  }
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '–';
  try {
    return format(parseISO(iso), 'dd.MM.yyyy HH:mm', { locale: de });
  } catch {
    return '–';
  }
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '–';
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: de });
  } catch {
    return '–';
  }
}

// ── Severity helpers ──────────────────────────────────────────────────────────
export const SEVERITY_ORDER: Record<Severity, number> = {
  CRITICAL: 5,
  HIGH: 4,
  MEDIUM: 3,
  LOW: 2,
  INFO: 1,
};

export function compareSeverity(a: Severity, b: Severity): number {
  return SEVERITY_ORDER[b] - SEVERITY_ORDER[a];
}

// ── Decision color ─────────────────────────────────────────────────────────────
export function getDecisionColor(decision: DecisionStatus | null | undefined): string {
  switch (decision) {
    case 'GO':
    case 'APPROVED':
      return 'text-green-600 dark:text-green-400';
    case 'NO_GO':
      return 'text-red-600 dark:text-red-400';
    case 'PENDING':
      return 'text-yellow-600 dark:text-yellow-400';
    default:
      return 'text-muted-foreground';
  }
}

// ── Truncate string ───────────────────────────────────────────────────────────
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

// ── Generate unique ID ────────────────────────────────────────────────────────
export function uid(): string {
  return Math.random().toString(36).slice(2, 11);
}

// ── Debounce ──────────────────────────────────────────────────────────────────
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

// ── API error helpers ─────────────────────────────────────────────────────────

/**
 * Extract a human-readable message from an Axios error.
 * Handles:
 * - 422 VALIDATION_ERROR (Moleculer Fastest-Validator): returns `data[0].message`
 * - 404 VNB_NOT_FOUND / 503 VNB_LOOKUP_ERROR: returns `message` from response body
 * - Network / unknown errors: returns the fallback string
 *
 * Resolved via RES-CR-0001 (2026-04-02).
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Unbekannter Fehler'
): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }
  const body = error.response?.data;
  if (!body) return error.message || fallback;

  // 422 VALIDATION_ERROR — first field message is most actionable
  if (error.response?.status === 422 && Array.isArray(body.data)) {
    const first = body.data[0] as ValidationFieldError | undefined;
    if (first?.message) return first.message;
  }

  // Other structured Moleculer errors (503 VNB_LOOKUP_ERROR, 404 VNB_NOT_FOUND, …)
  if (typeof body.message === 'string' && body.message) return body.message;

  return fallback;
}
