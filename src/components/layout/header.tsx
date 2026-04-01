'use client';

import { useRef, useState } from 'react';
import { Search, Sun, Moon, Monitor, LogOut, ChevronDown, Check, X } from 'lucide-react';
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
import { useVnbContext, useMarketPartnerSearch } from '@/hooks/use-vnb-context';
import { useThemeStore } from '@/stores/theme-store';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';

function VnbSelector() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { bdewCode, name, setVnb, clearVnb } = useVnbContext();
  const { data: partners, isLoading } = useMarketPartnerSearch(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  const select = (bdew: string, mastr: string, n: string) => {
    setVnb(bdew, mastr, n);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const showDropdown = open && (isLoading || query.length >= 2 || (query.length < 2));

  return (
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
            name && !query && 'placeholder:text-foreground'
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

      {showDropdown && (
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
                    onMouseDown={(e) => { e.preventDefault(); select(p.bdewCode, p.mastrId, p.name); }}
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
        <VnbSelector />
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
