import { cn } from '@/lib/utils';
import { SeverityChip } from '@/components/shared/severity-chip';
import { displayValue } from '@/lib/utils';
import type { FindingItem, Severity } from '@/types/ui';

interface FindingsTableProps {
  findings: FindingItem[];
  className?: string;
  isLoading?: boolean;
  maxRows?: number;
  showCode?: boolean;
}

const ALL_SEVERITIES: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="py-2 px-3"><div className="h-4 bg-muted rounded w-20" /></td>
      <td className="py-2 px-3"><div className="h-4 bg-muted rounded w-16" /></td>
      <td className="py-2 px-3"><div className="h-4 bg-muted rounded w-48" /></td>
      <td className="py-2 px-3"><div className="h-4 bg-muted rounded w-32" /></td>
    </tr>
  );
}

export function FindingsTable({
  findings,
  className,
  isLoading,
  maxRows,
  showCode = true,
}: FindingsTableProps) {
  const sorted = [...findings].sort(
    (a, b) =>
      ALL_SEVERITIES.indexOf(a.severity) - ALL_SEVERITIES.indexOf(b.severity)
  );
  const rows = maxRows ? sorted.slice(0, maxRows) : sorted;

  return (
    <div className={cn('w-full overflow-x-auto rounded-lg border', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="py-2 px-3 text-left font-medium text-muted-foreground whitespace-nowrap">
              Schwere
            </th>
            {showCode && (
              <th className="py-2 px-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                Code
              </th>
            )}
            <th className="py-2 px-3 text-left font-medium text-muted-foreground">
              Beschreibung
            </th>
            <th className="py-2 px-3 text-left font-medium text-muted-foreground">
              Feld / Wert
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : rows.map((f, idx) => (
                <tr key={`${f.code}-${idx}`} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2 px-3">
                    <SeverityChip severity={f.severity} size="sm" />
                  </td>
                  {showCode && (
                    <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                      {f.code}
                    </td>
                  )}
                  <td className="py-2 px-3">
                    <span className="font-medium">{f.titleDe}</span>
                    {f.titleEn && (
                      <span className="block text-xs text-muted-foreground">{f.titleEn}</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-muted-foreground font-mono text-xs">
                    {displayValue(f.field)}
                    {f.value !== undefined && (
                      <span className="block">{String(f.value)}</span>
                    )}
                  </td>
                </tr>
              ))}
          {!isLoading && rows.length === 0 && (
            <tr>
              <td
                colSpan={showCode ? 4 : 3}
                className="py-8 text-center text-muted-foreground"
              >
                Keine Findings
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
