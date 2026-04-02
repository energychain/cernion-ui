// ── Centralised API endpoint constants ────────────────────────────────────────
// All paths are relative to NEXT_PUBLIC_API_URL (no leading slash needed — axios adds it)

export const API = {
  // Auth
  TOKENS_VERIFY: '/api/tokens/verify',
  TOKENS_LIST: '/api/tokens',
  TOKENS_CREATE: '/api/tokens',
  TOKENS_DELETE: (id: string) => `/api/tokens/${id}`,

  // Jobs
  JOB_STATUS: (jobId: string) => `/api/job-status/${jobId}/status`,
  JOB_RESULT: (jobId: string) => `/api/job-status/${jobId}/result`,

  // Grid Operations / VNB
  MARKET_PARTNERS: '/api/grid-operations/market-partners',
  VNB_LOOKUP: '/api/grid-operations/vnb-lookup',
  VNB_LOOKUP_CODES: '/api/grid-operations/vnb-lookup-codes',
  REDISPATCH_EXPORT: '/api/grid-operations/redispatch-export',

  // Dashboard aggregates
  DASHBOARD_VNB_OVERVIEW: '/api/dashboard/vnb-overview',
  DASHBOARD_MARKET_SNAPSHOT: '/api/dashboard/market-snapshot',
  DASHBOARD_QUALITY_SUMMARY: '/api/dashboard/quality-summary',
  DASHBOARD_FINDING_CODES: '/api/dashboard/finding-codes',

  // Assets
  ASSETS_ALL: '/api/assets/all',
  ASSETS_SOLAR: '/api/assets/solar',
  ASSETS_WIND: '/api/assets/wind',
  ASSETS_STORAGE: '/api/assets/storage',
  ASSETS_BIOMASS: '/api/assets/biomass',
  ASSETS_LIST: '/api/assets/list',

  // Agent endpoints (async, return jobId)
  MASTR_AUDIT: '/api/mastr-quality/audit',
  GRID_CONNECTION_VALIDATE: '/api/grid-connection/validate',
  ENERGY_SHARING_VALIDATE: '/api/energy-sharing/validate',
  REDISPATCH_AUDIT: '/api/redispatch/audit',

  // Market / Energy
  ENERGY_MARKET_PRICES: '/api/energy-market/prices',
  ENERGY_MARKET_CO2: '/api/energy-market/co2-intensity',
  ENERGY_MARKET_PRODUCTION: '/api/energy-market/production',
  ENTSOE_DAY_AHEAD: '/api/entsoe/day-ahead-prices',
  ENTSOE_WIND_SOLAR_FORECAST: '/api/entsoe/wind-solar-forecast',
  ENTSOE_ACTUAL_GENERATION: '/api/entsoe/actual-generation',

  // Datapoints
  DATAPOINTS_LIST: '/api/datapoint/',
  DATAPOINT_DETAIL: (name: string) => `/api/datapoint/${name}`,
  DATAPOINT_DATA: (name: string) => `/api/datapoint/${name}/data`,
  DATAPOINT_REFRESH: (name: string) => `/api/datapoint/${name}/refresh`,
  DATAPOINT_HEALTH: '/api/datapoint/health/overview',
  DATAPOINT_SNAPSHOTS: '/api/datapoint/snapshots',
  DATAPOINT_SNAPSHOT: (id: string) => `/api/datapoint/snapshot/${id}`,
  DATAPOINT_SNAPSHOT_CREATE: '/api/datapoint/snapshot',

  // VNB Monitor
  VNB_MONITOR_LIST: '/api/vnb-monitor/',
  VNB_MONITOR_DETAIL: (bdewCode: string) => `/api/vnb-monitor/${bdewCode}`,
  VNB_MONITOR_ALERTS: (bdewCode: string) => `/api/vnb-monitor/${bdewCode}/alerts`,
  VNB_MONITOR_THRESHOLDS: '/api/vnb-monitor/thresholds',

  // NBP Monitor
  NBP_MONITOR_DETAIL: (bdewCode: string) => `/api/nbp-monitor/${bdewCode}`,
  NBP_MONITOR_PARAMS: '/api/nbp-monitor/parameters',

  // System
  SYSTEM_STATUS: '/api/system/status',
} as const;
/**
 * Fixed region for all market-snapshot calls.
 * ENTSO-E only supports country-level bidding zones — sub-national regions
 * (e.g. "Bayern") are invalid and return renewableForecast24h: null.
 * Resolved via RES-DR-0001 (2026-04-01).
 */
export const MARKET_SNAPSHOT_REGION = 'Germany';