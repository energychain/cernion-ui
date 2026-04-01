import { cn } from '@/lib/utils';
import { DECISION_COLORS } from '@/lib/constants';
import type { DecisionStatus } from '@/types/ui';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface DecisionBadgeProps {
  decision: DecisionStatus | null | undefined;
  className?: string;
}

const DECISION_LABELS: Record<DecisionStatus, string> = {
  GO: 'GO',
  APPROVED: 'Genehmigt',
  NO_GO: 'NO GO',
  PENDING: 'Ausstehend',
  ERROR: 'Fehler',
};

const DECISION_ICONS: Record<DecisionStatus, React.ReactNode> = {
  GO: <CheckCircle2 className="w-3.5 h-3.5" />,
  APPROVED: <CheckCircle2 className="w-3.5 h-3.5" />,
  NO_GO: <XCircle className="w-3.5 h-3.5" />,
  PENDING: <Clock className="w-3.5 h-3.5" />,
  ERROR: <AlertCircle className="w-3.5 h-3.5" />,
};

export function DecisionBadge({ decision, className }: DecisionBadgeProps) {
  if (!decision) {
    return (
      <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-medium border bg-slate-100 dark:bg-slate-800 text-muted-foreground border-slate-300 dark:border-slate-600', className)}>
        –
      </span>
    );
  }
  const colors = DECISION_COLORS[decision];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-semibold border',
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      {DECISION_ICONS[decision]}
      {DECISION_LABELS[decision]}
    </span>
  );
}
