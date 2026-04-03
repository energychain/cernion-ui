'use client';

import { useParams } from 'next/navigation';
import { differenceInDays, differenceInHours } from 'date-fns';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Agent metadata ─────────────────────────────────────────────────────────────

const AGENT_LABELS: Record<string, string> = {
  'mastr-audit':     'MaStR Datenqualität',
  'grid-connection': 'Netzanschluss-Validierung',
  'energy-sharing':  'Energy Sharing (§ 42c EnWG)',
  'redispatch':      'Redispatch Ex-Post',
};

const DEADLINE = new Date('2026-06-01');

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AgentQualityPage() {
  const params = useParams<{ agent: string }>();
  const agentKey = params?.agent ?? '';
  const label = AGENT_LABELS[agentKey];

  if (!label) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <p className="text-lg font-semibold">Unbekannte Seite</p>
        <p className="text-sm text-muted-foreground">
          Diese Qualitäts-Seite existiert nicht.
        </p>
      </div>
    );
  }

  const now = new Date();
  const totalDaysLeft = differenceInDays(DEADLINE, now);
  const remainingHours = differenceInHours(DEADLINE, now) % 24;

  const deadlineColor =
    totalDaysLeft < 30
      ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300'
      : totalDaysLeft < 90
        ? 'border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
        : 'border-border bg-card text-muted-foreground';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-bold tracking-tight">{label}</h1>
        <p className="text-sm text-muted-foreground">
          Wird in v0.20.3 implementiert.
        </p>
      </div>

      <div
        className={cn(
          'flex items-center gap-2.5 rounded-lg border px-5 py-3 text-sm font-medium',
          deadlineColor,
        )}
      >
        <Clock className="h-4 w-4 shrink-0" />
        <span>
          Bis § 42c EnWG-Frist:{' '}
          <span className="tabular-nums font-bold">
            {totalDaysLeft > 0
              ? `${totalDaysLeft} Tage${remainingHours > 0 ? ` ${remainingHours} h` : ''}`
              : 'Frist abgelaufen'}
          </span>
        </span>
      </div>
    </div>
  );
}
