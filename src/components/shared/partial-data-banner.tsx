import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PartialDataWarning } from '@/types/ui';

interface PartialDataBannerProps {
  /** Pass either a PartialDataWarning object or individual sources+messages */
  warning?: PartialDataWarning | null;
  sources?: string[];
  messages?: string[];
  className?: string;
}

export function PartialDataBanner({ warning, sources, messages, className }: PartialDataBannerProps) {
  const effectiveSources = warning?.sources ?? sources ?? [];
  const effectiveMessages = warning?.messages ?? messages ?? [];
  if (effectiveSources.length === 0 && effectiveMessages.length === 0) return null;

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 text-sm text-yellow-800 dark:text-yellow-300',
        className
      )}
      role="alert"
    >
      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium">Teildaten — einige Quellen nicht verfügbar</p>
        <ul className="mt-0.5 list-disc list-inside text-xs opacity-80">
          {effectiveMessages.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
