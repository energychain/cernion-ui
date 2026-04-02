// UI-specific types — not generated from OpenAPI

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type DecisionStatus = 'GO' | 'NO_GO' | 'APPROVED' | 'PENDING' | 'ERROR';

export type JobStatus = 'queued' | 'running' | 'completed' | 'error';

export interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
  children?: SidebarItem[];
  requiredScope?: 'read-only' | 'full-access' | 'admin';
}

export interface KpiCardConfig {
  label: string;
  value: number | string | null;
  unit?: string;
  trend?: number; // positive = up, negative = down
  threshold?: {
    warning: number;
    critical: number;
    direction: 'above' | 'below'; // above = higher is bad
  };
  format?: 'number' | 'percent' | 'currency' | 'datetime';
}

export interface FindingItem {
  code: string;
  severity: Severity;
  titleDe: string;
  titleEn: string;
  descriptionDe?: string;
  descriptionEn?: string;
  field?: string;
  value?: unknown;
  mastrNummer?: string;
}

export interface PipelineStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  durationMs?: number;
  details?: string;
}

export interface ApiLogEntry {
  id: string;
  method: string;
  url: string;
  status: number;
  latencyMs: number;
  timestamp: string;
  requestBody?: unknown;
  responseBody?: unknown;
}

export interface MarketPartner {
  bdewCode: string;
  mastrId: string;
  name: string;
  city?: string;
  type?: string;
}

export interface TokenInfo {
  id: string;
  name: string;
  scope: 'read-only' | 'full-access';
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface JobResult {
  jobId: string;
  service: string;
  action: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  result?: unknown;
  error?: string;
}

export interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  _errors?: string[];
}

/** One field-level error from Moleculer Fastest-Validator (422 VALIDATION_ERROR, `data[]`) */
export interface ValidationFieldError {
  type: string;
  message: string;
  field: string;
  actual?: unknown;
}

export interface PartialDataWarning {
  sources: string[];
  messages: string[];
}
