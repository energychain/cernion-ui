'use client';

import ReactECharts from 'echarts-for-react';
import { format } from 'date-fns';

import '@/config/echarts-config';
import { CHART_COLORS } from '@/config/echarts-config';
import { useCo2Intensity } from './use-spot-prices';
import { useVnbStore } from '@/stores/vnb-store';
import { useThemeStore } from '@/stores/theme-store';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// ── Signal badge ──────────────────────────────────────────────────────────────

function Co2SignalBadge({ value }: { value: number }) {
  if (value < 200) {
    return (
      <Badge className="border-0 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
        🟢 Grünstrom
      </Badge>
    );
  }
  if (value < 400) {
    return (
      <Badge className="border-0 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
        🟡 Gemischt
      </Badge>
    );
  }
  return (
    <Badge className="border-0 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
      🔴 Kohle-/Gasstrom
    </Badge>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Co2Panel() {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';
  const region = useVnbStore((s) => s.region);
  const locationLabel = region ?? 'Berlin';

  const { data, isLoading } = useCo2Intensity();

  const currentValue = data?.co2_intensity_gco2eq_kwh ?? 0;
  const forecastPoints = data?.data?.forecast ?? [];

  const textColor = isDark ? '#a1a1aa' : '#52525b';
  const lineColor = isDark ? '#3f3f46' : '#e4e4e7';

  // ── Gauge option ────────────────────────────────────────────────────────────

  const gaugeOption = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        min: 0,
        max: 800,
        startAngle: 200,
        endAngle: -20,
        pointer: { length: '60%', width: 4 },
        axisLine: {
          lineStyle: {
            width: 16,
            color: [
              [0.25, CHART_COLORS.co2Green],
              [0.5, CHART_COLORS.co2Yellow],
              [1, CHART_COLORS.co2Red],
            ],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: textColor,
          fontSize: 10,
          distance: -24,
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}',
          fontSize: 28,
          fontWeight: 'bold',
          color: isDark ? '#f4f4f5' : '#18181b',
          offsetCenter: [0, '60%'],
        },
        title: {
          offsetCenter: [0, '85%'],
          fontSize: 11,
          color: textColor,
        },
        data: [{ value: currentValue, name: 'gCO₂eq/kWh' }],
      },
    ],
  };

  // ── 36h forecast line option ────────────────────────────────────────────────

  const forecastTimestamps = forecastPoints.map((p) => p.timestamp);
  const forecastValues = forecastPoints.map((p) => p.gCO2eqPerKWh);

  const forecastOption = {
    backgroundColor: 'transparent',
    grid: { top: 12, right: 8, bottom: 24, left: 48 },
    xAxis: {
      type: 'category',
      data: forecastTimestamps,
      axisLabel: {
        color: textColor,
        fontSize: 10,
        formatter: (v: string) => {
          try {
            return format(new Date(v), 'HH:mm');
          } catch {
            return v;
          }
        },
      },
      axisLine: { lineStyle: { color: lineColor } },
    },
    yAxis: {
      type: 'value',
      name: 'gCO₂eq',
      nameTextStyle: { color: textColor, fontSize: 10 },
      axisLabel: { color: textColor, fontSize: 10 },
      splitLine: { lineStyle: { color: lineColor } },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#18181b' : '#ffffff',
      borderColor: lineColor,
      textStyle: { color: isDark ? '#f4f4f5' : '#18181b', fontSize: 11 },
    },
    series: [
      {
        type: 'line',
        data: forecastValues,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: CHART_COLORS.residual, width: 2 },
        color: CHART_COLORS.residual,
      },
    ],
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">
            CO₂-Intensität — {locationLabel}
          </CardTitle>
          {!isLoading && data && <Co2SignalBadge value={currentValue} />}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-52 w-full rounded-md" />
            <Skeleton className="h-52 w-full rounded-md" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gauge */}
            <ReactECharts
              option={gaugeOption}
              style={{ height: 220 }}
              notMerge
              theme={isDark ? 'dark' : undefined}
            />

            {/* 36 h forecast */}
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground font-medium">36 h Prognose</p>
              {forecastValues.length > 0 ? (
                <ReactECharts
                  option={forecastOption}
                  style={{ height: 180 }}
                  notMerge
                  theme={isDark ? 'dark' : undefined}
                />
              ) : (
                <p className="text-xs text-muted-foreground pt-4">
                  Keine Prognosedaten verfügbar
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
