'use client';

import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/hooks/use-api-client';
import { useVnbStore } from '@/stores/vnb-store';
import { API } from '@/config/api-endpoints';

// ── Response types ────────────────────────────────────────────────────────────

export interface PricePoint {
  timestamp: string;
  price: number;
  position: number;
}

export interface SpotPriceStatistics {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  medianPrice: number;
  totalDataPoints: number;
}

export interface SpotPricesResponse {
  success: boolean;
  region: string;
  eicCode: string;
  periodStart: string;
  periodEnd: string;
  resolution: string;
  currency: string;
  unit: string;
  prices: PricePoint[];
  statistics: SpotPriceStatistics;
}

export interface Co2ForecastPoint {
  timestamp: string;
  gCO2eqPerKWh: number;
}

export interface Co2IntensityResponse {
  success: boolean;
  co2_intensity_gco2eq_kwh: number;
  average_today_gco2eq_kwh: number;
  data: {
    location: string;
    timestamp: string;
    forecast: Co2ForecastPoint[];
  };
}

export interface ForecastPoint {
  timestamp: string;
  windOnshore: number;
  windOffshore: number;
  solar: number;
  total: number;
}

export interface RenewableForecastStatistics {
  totalForecastMWh: number;
  avgForecastMW: number;
  maxForecastMW: number;
  minForecastMW: number;
}

export interface RenewableForecastResponse {
  success: boolean;
  region: string;
  period: { from: string; to: string };
  forecasts: ForecastPoint[];
  statistics: RenewableForecastStatistics;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useSpotPrices(dateRange: { from: string; to: string }) {
  const { post } = useApiClient();
  return useQuery<SpotPricesResponse>({
    queryKey: ['spot-prices', dateRange],
    queryFn: () =>
      post<SpotPricesResponse>(API.ENTSOE_DAY_AHEAD, {
        region: 'Germany',
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        includeStatistics: true,
      }),
    staleTime: 15 * 60 * 1000,
    retry: false,
    throwOnError: false,
  });
}

/**
 * CO₂ intensity — location is derived from the selected VNB's region field
 * (city set by market-partners lookup). Falls back to 'Berlin' if not available.
 */
export function useCo2Intensity() {
  const { post } = useApiClient();
  const region = useVnbStore((s) => s.region);
  const location = region ?? 'Berlin';

  return useQuery<Co2IntensityResponse>({
    queryKey: ['co2-intensity', location],
    queryFn: () =>
      post<Co2IntensityResponse>(API.ENERGY_MARKET_CO2, {
        location,
        forecast: true,
      }),
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
    retry: false,
    throwOnError: false,
  });
}

export function useRenewableForecast(dateRange: { from: string; to: string }) {
  const { post } = useApiClient();
  return useQuery<RenewableForecastResponse>({
    queryKey: ['renewable-forecast', dateRange],
    queryFn: () =>
      post<RenewableForecastResponse>(API.ENTSOE_WIND_SOLAR_FORECAST, {
        region: 'Germany',
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        forecastType: 'both',
        includeStatistics: true,
      }),
    staleTime: 15 * 60 * 1000,
    retry: false,
    throwOnError: false,
  });
}
