'use client';

import { Terminal, X, Trash2, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useApiLogStore } from '@/stores/api-log-store';
import { cn } from '@/lib/utils';

function statusColor(status: number): string {
  if (status >= 500) return 'bg-red-500';
  if (status >= 400) return 'bg-orange-500';
  if (status >= 300) return 'bg-yellow-500';
  if (status >= 200) return 'bg-green-500';
  return 'bg-slate-400';
}

function methodColor(method: string): string {
  switch (method) {
    case 'GET': return 'text-green-600 dark:text-green-400';
    case 'POST': return 'text-blue-600 dark:text-blue-400';
    case 'PUT': return 'text-yellow-600 dark:text-yellow-400';
    case 'DELETE': return 'text-red-600 dark:text-red-400';
    default: return 'text-muted-foreground';
  }
}

export function ApiInspector() {
  const { entries, isOpen, setOpen, clearEntries } = useApiLogStore();

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-5 right-5 z-40 flex items-center gap-2',
          'rounded-full bg-primary px-3.5 py-2.5 text-primary-foreground shadow-lg',
          'hover:bg-primary/90 transition-colors text-xs font-medium',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        )}
        aria-label="API Inspector öffnen"
      >
        <Terminal className="h-3.5 w-3.5" />
        <span>API</span>
        {entries.length > 0 && (
          <span className="rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-xs tabular-nums">
            {entries.length}
          </span>
        )}
      </button>

      {/* Slide-Over */}
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[480px] sm:w-[540px] flex flex-col p-0">
          <SheetHeader className="flex-row items-center justify-between px-4 py-3 border-b">
            <SheetTitle className="flex items-center gap-2 text-sm">
              <Terminal className="h-4 w-4" />
              API Inspector
              <Badge variant="secondary" className="text-xs">
                {entries.length} Calls
              </Badge>
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={clearEntries}
              title="Log leeren"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </SheetHeader>

          <ScrollArea className="flex-1">
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Terminal className="h-8 w-8 mb-3 opacity-30" />
                <p className="text-sm">Noch keine API-Calls</p>
                <p className="text-xs mt-1 opacity-70">
                  Calls erscheinen hier automatisch
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {entries.map((entry) => (
                  <div key={entry.id} className="px-4 py-2.5 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          'text-xs font-mono font-bold w-12 shrink-0',
                          methodColor(entry.method)
                        )}
                      >
                        {entry.method}
                      </span>
                      <span className="flex-1 truncate font-mono text-xs text-foreground">
                        {entry.url}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-mono text-white',
                          statusColor(entry.status)
                        )}
                      >
                        {entry.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {entry.latencyMs}ms
                      </span>
                      <span>{new Date(entry.timestamp).toLocaleTimeString('de-DE')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
