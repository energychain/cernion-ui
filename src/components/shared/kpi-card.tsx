import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  getThresholdState,
  THRESHOLD_COLORS,
  THRESHOLD_BG_COLORS,
} from '@/config/thresholds';
import { displayValue, formatNumber, formatPercent, formatCurrency, formatDateTime } from '@/lib/utils';
import type { KpiCardConfig } from '@/types/ui';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps extends KpiCardConfig {
  className?: string;
  isLoading?: boolean;
  icon?: LucideIcon;
  href?: string;
}

function SkeletonKpiCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-4 animate-pulse', className)}>
      <div className="h-4 bg-muted rounded w-2/3 mb-3" />
      <div className="h-8 bg-muted rounded w-1/2 mb-2" />
      <div className="h-3 bg-muted rounded w-1/3" />
    </div>
  );
}

export function KpiCard({
  label,
  value,
  unit,
  trend,
  threshold,
  format = 'number',
  className,
  isLoading,
  icon: Icon,
  href,
}: KpiCardProps) {
  if (isLoading) return <SkeletonKpiCard className={className} />;

  const numValue = typeof value === 'number' ? value : null;
  const state =
    threshold && numValue !== null
      ? getThresholdState(numValue, threshold)
      : 'normal';

  let displayedValue: string;
  if (value === null || value === undefined) {
    displayedValue = '–';
  } else if (format === 'percent' && typeof value === 'number') {
    displayedValue = formatPercent(value);
  } else if (format === 'currency' && typeof value === 'number') {
    displayedValue = formatCurrency(value);
  } else if (format === 'datetime' && typeof value === 'string') {
    displayedValue = formatDateTime(value);
  } else if (typeof value === 'number') {
    displayedValue = formatNumber(value);
  } else {
    displayedValue = displayValue(value);
  }

  const card = (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 shadow-sm transition-colors',
        threshold && numValue !== null && THRESHOLD_BG_COLORS[state],
        href && 'cursor-pointer hover:ring-2 hover:ring-primary/30 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground opacity-60" />}
      </div>
      <div className="flex items-end gap-1.5">
        <span
          className={cn(
            'text-2xl font-bold tabular-nums',
            threshold && numValue !== null && THRESHOLD_COLORS[state]
          )}
        >
          {displayedValue}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground pb-0.5">{unit}</span>
        )}
      </div>
      {trend !== undefined && (
        <div
          className={cn(
            'flex items-center gap-0.5 mt-1 text-xs',
            trend > 0 ? 'text-green-600 dark:text-green-400' : trend < 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
          )}
        >
          {trend > 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : trend < 0 ? (
            <TrendingDown className="w-3 h-3" />
          ) : (
            <Minus className="w-3 h-3" />
          )}
          <span>{trend > 0 ? '+' : ''}{formatNumber(trend)} %</span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    );
  }
  return card;
}
