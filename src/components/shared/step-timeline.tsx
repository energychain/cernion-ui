import { cn } from '@/lib/utils';
import { Check, X, Clock, Play, SkipForward, Loader2 } from 'lucide-react';
import type { PipelineStep } from '@/types/ui';

interface StepTimelineProps {
  steps: PipelineStep[];
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

const STATUS_ICONS: Record<PipelineStep['status'], React.ReactNode> = {
  pending: <Clock className="w-3.5 h-3.5" />,
  running: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
  success: <Check className="w-3.5 h-3.5" />,
  error: <X className="w-3.5 h-3.5" />,
  skipped: <SkipForward className="w-3.5 h-3.5" />,
};

const STATUS_CLASSES: Record<PipelineStep['status'], string> = {
  pending: 'bg-muted text-muted-foreground border-border',
  running: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700',
  success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700',
  error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700',
  skipped: 'bg-muted text-muted-foreground border-border opacity-60',
};

export function StepTimeline({ steps, className, orientation = 'vertical' }: StepTimelineProps) {
  if (orientation === 'horizontal') {
    return (
      <div className={cn('flex items-start gap-0', className)}>
        {steps.map((step, idx) => (
          <div key={step.id} className="flex-1 flex flex-col items-center">
            <div className="flex items-center w-full">
              <div
                className={cn(
                  'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center',
                  STATUS_CLASSES[step.status]
                )}
              >
                {STATUS_ICONS[step.status]}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5',
                    step.status === 'success'
                      ? 'bg-green-400 dark:bg-green-600'
                      : 'bg-border'
                  )}
                />
              )}
            </div>
            <p className="mt-1.5 text-xs text-center text-muted-foreground max-w-[80px]">
              {step.label}
            </p>
            {step.durationMs !== undefined && (
              <p className="text-[10px] text-muted-foreground">{step.durationMs} ms</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <ol className={cn('relative ml-3', className)}>
      {steps.map((step, idx) => (
        <li key={step.id} className="flex gap-3 pb-5 last:pb-0">
          {/* connector line */}
          {idx < steps.length - 1 && (
            <div
              className={cn(
                'absolute ml-[11px] mt-7 w-0.5',
                'h-full',
                step.status === 'success' ? 'bg-green-400 dark:bg-green-600' : 'bg-border'
              )}
              style={{ height: 'calc(100% - 28px)', top: 28 }}
            />
          )}
          <div
            className={cn(
              'relative flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[11px] z-10',
              STATUS_CLASSES[step.status]
            )}
          >
            {STATUS_ICONS[step.status]}
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-medium">{step.label}</p>
            {step.details && (
              <p className="text-xs text-muted-foreground mt-0.5">{step.details}</p>
            )}
            {step.durationMs !== undefined && (
              <p className="text-xs text-muted-foreground">{step.durationMs} ms</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
