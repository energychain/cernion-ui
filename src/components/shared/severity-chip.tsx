import { cn } from '@/lib/utils';
import { SEVERITY_COLORS } from '@/lib/constants';
import type { Severity } from '@/types/ui';

interface SeverityChipProps {
  severity: Severity | string | null | undefined;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const SEVERITY_LABELS: Record<Severity, string> = {
  CRITICAL: 'Kritisch',
  HIGH: 'Hoch',
  MEDIUM: 'Mittel',
  LOW: 'Niedrig',
  INFO: 'Info',
};

function normalizeSeverity(value: SeverityChipProps['severity']): Severity {
  const s = String(value ?? '').trim().toUpperCase();

  if (s === 'CRITICAL' || s === 'HIGH' || s === 'MEDIUM' || s === 'LOW' || s === 'INFO') {
    return s;
  }

  // Common backend aliases
  if (s === 'ERROR' || s === 'FATAL') return 'CRITICAL';
  if (s === 'WARN' || s === 'WARNING') return 'HIGH';
  if (s === 'DEBUG' || s === 'TRACE') return 'INFO';

  return 'INFO';
}

export function SeverityChip({
  severity,
  label,
  size = 'md',
  className,
}: SeverityChipProps) {
  const normalized = normalizeSeverity(severity);
  const colors = SEVERITY_COLORS[normalized];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium border',
        colors.bg,
        colors.text,
        colors.border,
        size === 'sm'
          ? 'px-2 py-0.5 text-xs'
          : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <span className={cn('inline-block w-1.5 h-1.5 rounded-full', colors.dot)} />
      {label ?? SEVERITY_LABELS[normalized]}
    </span>
  );
}
