// ── App-wide static constants ─────────────────────────────────────────────────

export const APP_NAME = 'Cernion Enterprise UI';
export const APP_VERSION = '0.20.0';

// ── Local-storage keys ────────────────────────────────────────────────────────
export const LS_TOKEN_KEY = 'cernion_token';
export const LS_TOKEN_NAME_KEY = 'cernion_token_name';

// ── Polling intervals (ms) ─────────────────────────────────────────────────────
export const JOB_POLL_INTERVAL_MS = 2000;
export const JOB_POLL_MAX_ATTEMPTS = 60; // 2 min max

// ── AG Grid defaults ──────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ── API log size cap ──────────────────────────────────────────────────────────
export const API_LOG_MAX_ENTRIES = 50;

// ── Stale-time for React Query ────────────────────────────────────────────────
export const STALE_TIME_SHORT = 30_000;   // 30 s — real-time data
export const STALE_TIME_MEDIUM = 300_000;  // 5 min — aggregated KPIs
export const STALE_TIME_LONG = 3_600_000; // 1 h — rarely changing data

// ── Energy Sharing deadline ────────────────────────────────────────────────────
export const ENERGY_SHARING_DEADLINE = new Date('2026-06-01T00:00:00Z');

// ── VNB Monitor alert thresholds (defaults, can be overridden per VNB) ─────────
export const DEFAULT_THRESHOLD_OVERLOAD = 90;     // % grid utilisation
export const DEFAULT_THRESHOLD_VOLTAGE_BAND = 3;   // % deviation
export const DEFAULT_THRESHOLD_DISCONNECTION = 5;  // events / month

// ── Severity colors (Tailwind) ────────────────────────────────────────────────
export const SEVERITY_COLORS = {
  CRITICAL: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-300 dark:border-red-700',
    dot: 'bg-red-500',
  },
  HIGH: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-300 dark:border-orange-700',
    dot: 'bg-orange-500',
  },
  MEDIUM: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-300 dark:border-yellow-700',
    dot: 'bg-yellow-500',
  },
  LOW: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-700',
    dot: 'bg-blue-500',
  },
  INFO: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-300 dark:border-slate-600',
    dot: 'bg-slate-400',
  },
} as const;

// ── Decision badge colors (Tailwind) ──────────────────────────────────────────
export const DECISION_COLORS = {
  GO: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-300 dark:border-green-700',
  },
  APPROVED: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-300 dark:border-green-700',
  },
  NO_GO: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-300 dark:border-red-700',
  },
  PENDING: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-300 dark:border-yellow-700',
  },
  ERROR: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-300 dark:border-slate-600',
  },
} as const;
