'use client';

import { useRef, useState, useEffect } from 'react';
import { Search, Sun, Moon, Monitor, LogOut, ChevronDown, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useVnbContext, useMarketPartnerSearch, useResolveVnbIdentity } from '@/hooks/use-vnb-context';
import { useThemeStore } from '@/stores/theme-store';
import { VnbConflictDialog } from '@/components/shared/vnb-conflict-dialog';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import type { ResolvedVnbIdentity } from '@/hooks/use-vnb-context';

/**
 * Shown when VnbSelector crashes (e.g. backend 500 during identity resolution).
 * Lets the user clear the stored VNB and try again without a page reload.
 */
function VnbSelectorFallback({ onReset }: { onReset: () => void }) {
  const { clearVnb } = useVnbContext();
  return (
    <button
      type="button"
      onClick={() => { clearVnb(); onReset(); }}
      className="flex h-9 items-center gap-2 rounded-md border border-destructive/50 bg-destructive/5 px-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
    >
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span>VNB-Fehler — klicken zum Zurücksetzen</span>
    </button>
  );
}

function VnbSelector() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const { bdewCode: storedBdewCode, name, setVnb, clearVnb } = useVnbContext();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const bdewCode = mounted ? storedBdewCode : null;
  const { data: partners, isLoading } = useMarketPartnerSearch(query);
  const { data: resolvedIdentity } = useResolveVnbIdentity(bdewCode);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showWarning = resolvedIdentity && !resolvedIdentity.resolved;
  const hasConflict =
    showWarning && resolvedIdentity.conflictFlags.includes('multiple_strong_bdew_codes');

  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  const select = (bdew: string, mastr: string, n: string, city?: string) => {
    setVnb(bdew, mastr, n, city);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleSelectCandidate = (bdewCode: string, mastrId: string, name: string) => {
    setVnb(bdewCode, mastrId, name);
  };

  return (
    <>
      <div ref={containerRef} className="relative w-64" onBlur={handleBlur}>
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder={name ?? 'VNB auswählen…'}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            className={cn(
              'h-9 w-full rounded-md border border-input bg-background pl-8 pr-8 text-sm shadow-sm',
              'placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring',
              name && !query && 'placeholder:text-foreground',
              showWarning && 'border-yellow-500 focus:ring-yellow-500'
            )}
          />
          {(query || bdewCode) && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); clearVnb(); setQuery(''); setOpen(false); }}
              className="absolute right-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* MaStR-ID warning badge */}
        {showWarning && bdewCode && (
          <button
            type="button"
            onClick={() => setConflictDialogOpen(true)}
            className="mt-1 flex w-full items-center gap-1.5 rounded-md bg-yellow-50 px-2 py-1 text-left text-xs text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-300 dark:hover:bg-yellow-900 transition-colors"
          >
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {hasConflict
                ? '⚠ Kein MaStR-ID — andere BDEW-Codes anzeigen'
                : '⚠ Kein MaStR-ID — Daten möglicherweise unvollständig'}
            </span>
          </button>
        )}

        {open && (
          <div className="absolute top-full left-0 z-50 mt-1 w-80 rounded-md border bg-popover shadow-md overflow-hidden">
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">Suche…</div>
            )}
            {!isLoading && query.length < 2 && (
              <div className="py-4 text-center text-sm text-muted-foreground">Mindestens 2 Zeichen eingeben.</div>
            )}
            {!isLoading && query.length >= 2 && (!partners || partners.length === 0) && (
              <div className="py-4 text-center text-sm text-muted-foreground">Kein VNB gefunden.</div>
            )}
            {partners && partners.length > 0 && (
              <ul className="max-h-72 overflow-y-auto py-1">
                {partners.map((p, idx) => (
                  <li key={`${p.bdewCode}-${p.name}-${p.mastrId || 'na'}-${idx}`}>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); select(p.bdewCode, p.mastrId, p.name, p.city); }}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                        bdewCode === p.bdewCode && 'bg-accent/50'
                      )}
                    >
                      <Check className={cn('h-3.5 w-3.5 shrink-0', bdewCode === p.bdewCode ? 'opacity-100' : 'opacity-0')} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.bdewCode}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {showWarning && resolvedIdentity && (
        <VnbConflictDialog
          open={conflictDialogOpen}
          onOpenChange={setConflictDialogOpen}
          identity={resolvedIdentity as ResolvedVnbIdentity}
          onSelectCandidate={handleSelectCandidate}
        />
      )}
    </>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const THEMES = [
    { value: 'light', label: 'Hell', icon: Sun },
    { value: 'dark', label: 'Dunkel', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  const current = THEMES.find((t) => t.value === theme) ?? THEMES[2];
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Theme wechseln">
          <Icon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Erscheinungsbild</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEMES.map(({ value, label, icon: ItemIcon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="gap-2"
          >
            <ItemIcon className="h-4 w-4" />
            {label}
            {theme === value && <Check className="h-3.5 w-3.5 ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const { tokenName, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur px-4">
      <div className="flex-1 min-w-0">
        <ErrorBoundary
          fallback={(reset) => <VnbSelectorFallback onReset={reset} />}
        >
          <VnbSelector />
        </ErrorBoundary>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <span className="max-w-32 truncate text-sm">
                {tokenName ?? 'Token'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              {APP_NAME}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="gap-2 text-destructive">
              <LogOut className="h-4 w-4" />
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
