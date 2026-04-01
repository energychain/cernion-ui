'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, TrendingUp, ShieldCheck, LayoutList, DatabaseZap,
  Plug, Share2, Layers, ArrowLeftRight, Zap, Database, Activity,
  Network, Radio, Settings, Key, Clock, Server, ChevronDown,
  ChevronRight, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermission } from '@/hooks/use-permission';
import { APP_NAME } from '@/lib/constants';
import type { SidebarItem } from '@/types/ui';
import { MENU_ITEMS } from '@/config/menu';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, TrendingUp, ShieldCheck, LayoutList, DatabaseZap,
  Plug, Share2, Layers, ArrowLeftRight, Zap, Database, Activity,
  Network, Radio, Settings, Key, Clock, Server,
};

function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

interface NavItemProps {
  item: SidebarItem;
  collapsed: boolean;
  depth?: number;
}

function NavItem({ item, collapsed, depth = 0 }: NavItemProps) {
  const pathname = usePathname();
  const hasAccess = usePermission(
    (item.requiredScope as 'read-only' | 'full-access') ?? 'read-only'
  );
  const [open, setOpen] = useState(() =>
    item.children?.some((c) => pathname.startsWith(c.href)) ?? false
  );

  if (!hasAccess) return null;

  const isActive =
    item.href === '/'
      ? pathname === '/'
      : pathname === item.href || pathname.startsWith(item.href + '/');

  if (item.children && item.children.length > 0) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            isActive && 'bg-accent text-accent-foreground',
            collapsed && 'justify-center px-2'
          )}
        >
          <NavIcon name={item.icon} className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-left">{item.label}</span>
              {open ? (
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              )}
            </>
          )}
        </button>
        {!collapsed && open && (
          <div className="mt-0.5 ml-3 border-l border-border pl-2">
            {item.children.map((child) => (
              <NavItem key={child.href} item={child} collapsed={false} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground',
        collapsed && 'justify-center px-2',
        depth > 0 && 'py-1.5 text-sm'
      )}
      title={collapsed ? item.label : undefined}
    >
      <NavIcon name={item.icon} className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge !== undefined && (
        <span className="ml-auto rounded-full bg-primary/20 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-primary">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-card transition-all duration-200',
        collapsed ? 'w-14' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-3 border-b border-border">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-sm leading-tight">{APP_NAME.split(' ')[0]}</span>
          </Link>
        )}
        {collapsed && <Zap className="mx-auto h-5 w-5 text-primary" />}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors',
            collapsed && 'mx-auto'
          )}
          aria-label={collapsed ? 'Sidebar öffnen' : 'Sidebar schließen'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {MENU_ITEMS.map((item) => (
          <NavItem key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-border px-3 py-2">
          <p className="text-xs text-muted-foreground">v0.20.0</p>
        </div>
      )}
    </aside>
  );
}
