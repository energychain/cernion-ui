'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ResolvedVnbIdentity } from '@/hooks/use-vnb-context';

interface VnbConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  identity: ResolvedVnbIdentity;
  onSelectCandidate: (bdewCode: string, mastrId: string, name: string) => void;
}

export function VnbConflictDialog({
  open,
  onOpenChange,
  identity,
  onSelectCandidate,
}: VnbConflictDialogProps) {
  const hasConflict = identity.conflictFlags.includes('multiple_strong_bdew_codes');
  const candidatesWithMastr = identity.candidates.filter((c) => c.mastrId && c.bdewCode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ⚠ VNB-Identität unvollständig
          </DialogTitle>
          <DialogDescription>
            BDEW-Code{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
              {identity.bdewCode}
            </code>{' '}
            hat keine zugeordnete MaStR-ID. Alle nachgelagerten API-Calls liefern
            möglicherweise keine Daten.
          </DialogDescription>
        </DialogHeader>

        {hasConflict && candidatesWithMastr.length > 0 && (
          <div className="mt-2 space-y-2">
            <p className="text-sm font-medium text-foreground">
              Weitere BDEW-Codes für diesen VNB gefunden:
            </p>
            <ul className="space-y-1.5">
              {candidatesWithMastr.map((c) => (
                <li key={c.bdewCode}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCandidate(c.bdewCode!, c.mastrId!, c.name ?? identity.name ?? '');
                      onOpenChange(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground font-mono">{c.bdewCode}</p>
                    </div>
                    <div className="ml-3 flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        MaStR ✓
                      </Badge>
                      {c.source && (
                        <span className="text-[10px] text-muted-foreground">{c.source}</span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(!hasConflict || candidatesWithMastr.length === 0) && (
          <p className="text-sm text-muted-foreground">
            Keine alternativen BDEW-Codes mit MaStR-ID verfügbar. Bitte wende dich an das
            Backend-Team (siehe{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
              feedback/BR-0001-vnb-bdew-null-kpis.md
            </code>
            ).
          </p>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Schließen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
