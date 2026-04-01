import { cn, formatDate } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Inbox, Construction, AlertTriangle } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'Keine Daten',
  description = 'Es sind keine Einträge vorhanden.',
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 text-center text-muted-foreground',
        className
      )}
    >
      <Icon className="w-10 h-10 opacity-40" />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm mt-0.5">{description}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

interface ComingSoonProps {
  title: string;
  description?: string;
  deadline?: Date;
}

export function ComingSoon({ title, description, deadline }: ComingSoonProps) {
  const daysLeft = deadline ? differenceInDays(deadline, new Date()) : null;
  const isUrgent = daysLeft !== null && daysLeft <= 60;

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
        <Construction className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        )}
      </div>
      {deadline && daysLeft !== null && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm',
            isUrgent
              ? 'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
              : 'border-border bg-muted text-muted-foreground'
          )}
        >
          {isUrgent && <AlertTriangle className="h-4 w-4 shrink-0" />}
          <span>
            Frist: <strong>{formatDate(deadline.toISOString())}</strong>
            {' '}— noch {daysLeft} Tage
          </span>
        </div>
      )}
    </div>
  );
}
