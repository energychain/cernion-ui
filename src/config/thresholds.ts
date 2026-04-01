// ── KPI threshold configuration ───────────────────────────────────────────────
// direction: 'above' = higher value is bad (e.g. overload)
//             'below' = lower value is bad (e.g. quality score)

export const THRESHOLDS = {
  // Grid utilisation (%)
  gridUtilisation: {
    warning: 75,
    critical: 90,
    direction: 'above' as const,
  },

  // Voltage band deviation (%)
  voltageBand: {
    warning: 2,
    critical: 3,
    direction: 'above' as const,
  },

  // MaStR quality score (0–100)
  mastrQualityScore: {
    warning: 70,
    critical: 50,
    direction: 'below' as const,
  },

  // Settlement readiness (%)
  settlementReadiness: {
    warning: 80,
    critical: 60,
    direction: 'below' as const,
  },

  // Energy sharing coverage (%)
  energySharingCoverage: {
    warning: 50,
    critical: 20,
    direction: 'below' as const,
  },

  // Job latency (ms)
  jobLatencyMs: {
    warning: 5000,
    critical: 15000,
    direction: 'above' as const,
  },

  // API response latency (ms)
  apiLatencyMs: {
    warning: 1000,
    critical: 5000,
    direction: 'above' as const,
  },

  // Spot price (€/MWh) — context-dependent, these are illustrative
  spotPriceHigh: {
    warning: 150,
    critical: 300,
    direction: 'above' as const,
  },

  // CO₂ intensity (gCO₂eq/kWh)
  co2Intensity: {
    warning: 300,
    critical: 450,
    direction: 'above' as const,
  },
} as const;

export type ThresholdKey = keyof typeof THRESHOLDS;

/**
 * Returns 'normal' | 'warning' | 'critical' based on a value + threshold config.
 */
export function getThresholdState(
  value: number,
  threshold: { warning: number; critical: number; direction: 'above' | 'below' }
): 'normal' | 'warning' | 'critical' {
  if (threshold.direction === 'above') {
    if (value >= threshold.critical) return 'critical';
    if (value >= threshold.warning) return 'warning';
    return 'normal';
  } else {
    if (value <= threshold.critical) return 'critical';
    if (value <= threshold.warning) return 'warning';
    return 'normal';
  }
}

export const THRESHOLD_COLORS = {
  normal: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  critical: 'text-red-600 dark:text-red-400',
} as const;

export const THRESHOLD_BG_COLORS = {
  normal: 'bg-green-50 dark:bg-green-900/20',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20',
  critical: 'bg-red-50 dark:bg-red-900/20',
} as const;
