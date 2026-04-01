'use client';

import { cn } from '@/lib/utils';
import { useJobPolling } from '@/hooks/use-job-polling';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { JobStatus } from '@/types/ui';

interface JobProgressProps {
  jobId: string | null;
  label?: string;
  onComplete?: (result: unknown) => void;
  onError?: (error: string) => void;
  className?: string;
}

const STATUS_CONFIG: Record<JobStatus, { icon: React.ReactNode; label: string; color: string }> = {
  queued: {
    icon: <Clock className="w-4 h-4" />,
    label: 'Warte auf Ausführung…',
    color: 'text-muted-foreground',
  },
  running: {
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    label: 'Wird ausgeführt…',
    color: 'text-blue-600 dark:text-blue-400',
  },
  completed: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: 'Abgeschlossen',
    color: 'text-green-600 dark:text-green-400',
  },
  error: {
    icon: <XCircle className="w-4 h-4" />,
    label: 'Fehler',
    color: 'text-red-600 dark:text-red-400',
  },
};

export function JobProgress({ jobId, label, onComplete, onError, className }: JobProgressProps) {
  const { status } = useJobPolling({ jobId, onComplete, onError });

  if (!jobId || !status) return null;

  const config = STATUS_CONFIG[status as JobStatus] ?? STATUS_CONFIG.queued;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/40 text-sm',
        config.color,
        className
      )}
    >
      {config.icon}
      <span className="font-medium">{label ?? 'Job'}</span>
      <span className="text-muted-foreground">—</span>
      <span>{config.label}</span>
      {jobId && (
        <span className="ml-auto font-mono text-xs text-muted-foreground opacity-60 truncate max-w-[120px]">
          {jobId}
        </span>
      )}
    </div>
  );
}
