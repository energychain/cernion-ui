'use client';

import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { subDays, addDays, format } from 'date-fns';

import '@/config/echarts-config';
import { CHART_COLORS } from '@/config/echarts-config';
import { useSpotPrices } from './use-spot-prices';
import { useThemeStore } from '@/stores/theme-store';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';

// ── Date helpers ──────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

type RangePreset = '24h' | '7d' | '30d' | 'custom';

function presetToRange(preset: Exclude<RangePreset, 'custom'>): {
  from: string;
  to: string;
} {
  const today = new Date();
  switch (preset) {
    case '24h':
      return { from: toDateStr(subDays(today, 1)), to: toDateStr(today) };
    case '7d':
      return { from: toDateStr(subDays(today, 7)), to: toDateStr(today) };
    case '30d':
      return { from: toDateStr(subDays(today, 30)), to: toDateStr(today) };
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SpotPriceChart() {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';

  const [preset, setPreset] = useState<RangePreset>('7d');
  const [customFrom, setCustomFrom] = useState(toDateStr(subDays(new Date(), 7)));
  const [customTo, setCustomTo] = useState(toDateStr(new Date()));

  const dateRange =
    preset === 'custom'
      ? { from: customFrom, to: customTo }
      : presetToRange(preset);

  const { data, isLoading } = useSpotPrices(dateRange);

  // ── Chart option ─────────────────────────────────────────────────────────────

  const prices = data?.prices ?? [];
  const timestamps = prices.map((p) => p.timestamp);
  const values = prices.map((p) => p.price);

  const textColor = isDark ? '#a1a1aa' : '#52525b';
  const lineColor = isDark ? '#3f3f46' : '#e4e4e7';

  const chartOption = {
    backgroundColor: 'transparent',
    grid: { top: 32, right: 16, bottom: 80, left: 56 },
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
      name: '€/MWh',
      nameTextStyle: { color: textColor, fontSize: 11 },
      axisLabel: { color: textColor, fontSize: 11 },
      splitLine: { lineStyle: { color: lineColor } },
    },
    visualMap: {
      show: false,
      type: 'piecewise',
      dimension: 1,
      seriesIndex: 0,
      pieces: [
        { max: 0, color: '#1E3A5F' },
        { min: 0, max: 40, color: CHART_COLORS.co2Green },
        { min: 40, max: 80, color: CHART_COLORS.co2Yellow },
        { min: 80, color: CHART_COLORS.co2Red },
      ],
    },
    dataZoom: [
      {
        type: 'slider',
        bottom: 12,
        height: 20,
        borderColor: lineColor,
        textStyle: { color: textColor, fontSize: 10 },
      },
      { type: 'inside' },
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#18181b' : '#ffffff',
      borderColor: lineColor,
      textStyle: { color: isDark ? '#f4f4f5' : '#18181b', fontSize: 12 },
      formatter: (params: Array<{ axisValue: string; value: number }>) => {
        const p = params[0];
        if (!p) return '';
        try {
          const dt = format(new Date(p.axisValue), 'dd.MM.yyyy HH:mm');
          return `${dt}<br/><b>${formatNumber(p.value, { maximumFractionDigits: 2 })} €/MWh</b>`;
        } catch {
          return `${p.value} €/MWh`;
        }
      },
    },
    series: [
      {
        type: 'line',
        data: values,
        smooth: true,
        symbol: 'none',
        areaStyle: { opacity: 0.15 },
        lineStyle: { width: 2 },
        color: CHART_COLORS.price,
      },
    ],
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">Day-Ahead Spotpreise</CardTitle>

          {/* Range buttons */}
          <div className="flex items-center gap-1.5">
            {(['24h', '7d', '30d', 'custom'] as const).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={preset === p ? 'default' : 'outline'}
                onClick={() => setPreset(p)}
                className="h-7 text-xs px-2.5"
              >
                {p === '24h' ? '24 h' : p === '7d' ? '7 Tage' : p === '30d' ? '30 Tage' : 'Benutzerdefiniert'}
              </Button>
            ))}
          </div>

          {/* Custom range inputs */}
          {preset === 'custom' && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-7 text-xs w-36"
              />
              <span className="text-xs text-muted-foreground">–</span>
              <Input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-7 text-xs w-36"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <Skeleton className="h-96 w-full rounded-md" />
        ) : (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Chart */}
            <div className="flex-1 min-w-0">
              <ReactECharts
                option={chartOption}
                style={{ height: 380 }}
                notMerge
                theme={isDark ? 'dark' : undefined}
              />
            </div>

            {/* Statistics card */}
            {data?.statistics && (
              <div className="lg:w-44 shrink-0">
                <div className="rounded-md border p-3 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Statistik
                  </p>
                  {[
                    { label: 'Min', value: data.statistics.minPrice },
                    { label: 'Max', value: data.statistics.maxPrice },
                    { label: 'Ø', value: data.statistics.avgPrice },
                    { label: 'Median', value: data.statistics.medianPrice },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <Badge
                        variant="outline"
                        className="text-xs font-mono tabular-nums"
                      >
                        {formatNumber(value, { maximumFractionDigits: 2 })} €/MWh
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
