'use client';

import { addDays, format } from 'date-fns';

import ReactECharts from 'echarts-for-react';

import '@/config/echarts-config';
import { CHART_COLORS } from '@/config/echarts-config';
import { useRenewableForecast } from './use-spot-prices';
import type { ForecastPoint } from './use-spot-prices';
import { useThemeStore } from '@/stores/theme-store';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// ── Date helpers ──────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

const today = new Date();
const DEFAULT_RANGE = {
  from: toDateStr(today),
  to: toDateStr(addDays(today, 2)),
};

// ── KPI card ──────────────────────────────────────────────────────────────────

function ForecastKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card p-3 shadow-sm">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-lg font-semibold tabular-nums mt-0.5">{value}</p>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RenewableForecast() {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';

  const { data, isLoading } = useRenewableForecast(DEFAULT_RANGE);

  const forecasts: ForecastPoint[] = data?.forecasts ?? [];

  // ── KPI calculations ────────────────────────────────────────────────────────

  const maxSolarMW = forecasts.reduce((m, f) => Math.max(m, f.solar), 0);
  const maxWindMW = forecasts.reduce(
    (m, f) => Math.max(m, f.windOnshore + f.windOffshore),
    0,
  );

  let combinedPeakTs = '';
  let combinedPeakMax = 0;
  for (const f of forecasts) {
    if (f.total > combinedPeakMax) {
      combinedPeakMax = f.total;
      combinedPeakTs = f.timestamp;
    }
  }

  const combinedPeakTime = combinedPeakTs
    ? new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(
        new Date(combinedPeakTs),
      )
    : '–';

  // ── Chart option ─────────────────────────────────────────────────────────────

  const timestamps = forecasts.map((f) => f.timestamp);

  const textColor = isDark ? '#a1a1aa' : '#52525b';
  const lineColor = isDark ? '#3f3f46' : '#e4e4e7';

  const chartOption = {
    backgroundColor: 'transparent',
    grid: { top: 16, right: 16, bottom: 64, left: 56 },
    xAxis: {
      type: 'category',
      data: timestamps,
      axisLabel: {
        color: textColor,
        fontSize: 11,
        formatter: (v: string) => {
          try {
            return format(new Date(v), 'dd.MM HH:mm');
          } catch {
            return v;
          }
        },
      },
      axisLine: { lineStyle: { color: lineColor } },
    },
    yAxis: {
      type: 'value',
      name: 'MW',
      nameTextStyle: { color: textColor, fontSize: 11 },
      axisLabel: { color: textColor, fontSize: 11 },
      splitLine: { lineStyle: { color: lineColor } },
    },
    legend: {
      bottom: 8,
      textStyle: { color: textColor, fontSize: 11 },
      data: ['Solar', 'Wind Onshore', 'Wind Offshore'],
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#18181b' : '#ffffff',
      borderColor: lineColor,
      textStyle: { color: isDark ? '#f4f4f5' : '#18181b', fontSize: 12 },
    },
    series: [
      {
        name: 'Solar',
        type: 'line',
        stack: 'total',
        smooth: true,
        symbol: 'none',
        data: forecasts.map((f) => f.solar),
        areaStyle: { opacity: 0.6 },
        lineStyle: { color: CHART_COLORS.solar, width: 1.5 },
        color: CHART_COLORS.solar,
        itemStyle: { color: CHART_COLORS.solar },
      },
      {
        name: 'Wind Onshore',
        type: 'line',
        stack: 'total',
        smooth: true,
        symbol: 'none',
        data: forecasts.map((f) => f.windOnshore),
        areaStyle: { opacity: 0.6 },
        lineStyle: { color: CHART_COLORS.wind, width: 1.5 },
        color: CHART_COLORS.wind,
        itemStyle: { color: CHART_COLORS.wind },
      },
      {
        name: 'Wind Offshore',
        type: 'line',
        stack: 'total',
        smooth: true,
        symbol: 'none',
        data: forecasts.map((f) => f.windOffshore),
        areaStyle: { opacity: 0.6 },
        lineStyle: { color: CHART_COLORS.windOffshore, width: 1.5 },
        color: CHART_COLORS.windOffshore,
        itemStyle: { color: CHART_COLORS.windOffshore },
      },
    ],
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Erneuerbare Erzeugungsprognose (48 h)</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* KPI cards */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <ForecastKpi
              label="Solar-Peak"
              value={`${(maxSolarMW / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} GW`}
            />
            <ForecastKpi
              label="Wind-Peak"
              value={`${(maxWindMW / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} GW`}
            />
            <ForecastKpi label="Combined-Peak" value={combinedPeakTime} />
          </div>
        )}

        {/* Chart */}
        {isLoading ? (
          <Skeleton className="h-72 w-full rounded-md" />
        ) : forecasts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Keine Prognosedaten verfügbar
          </p>
        ) : (
          <ReactECharts
            option={chartOption}
            style={{ height: 280 }}
            notMerge
            theme={isDark ? 'dark' : undefined}
          />
        )}
      </CardContent>
    </Card>
  );
}
