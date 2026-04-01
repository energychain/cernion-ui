'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const PATH_LABELS: Record<string, string> = {
  market: 'Energiemarkt',
  quality: 'Qualität',
  'mastr-audit': 'MaStR-Audit',
  'grid-connection': 'Netzanschluss',
  'energy-sharing': 'Energy Sharing',
  allocation: 'Allokation',
  redispatch: 'Redispatch',
  assets: 'Anlagen & Netz',
  datapoints: 'Datenpunkte',
  monitors: 'Monitoring',
  vnb: 'VNB-Monitor',
  nbp: 'NBP-Monitor',
  admin: 'Administration',
  tokens: 'API-Token',
  jobs: 'Jobs',
  system: 'System',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, idx) => ({
    label: PATH_LABELS[segment] ?? segment,
    href: '/' + segments.slice(0, idx + 1).join('/'),
    isLast: idx === segments.length - 1,
  }));

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link
        href="/"
        className="hover:text-foreground transition-colors"
        aria-label="Dashboard"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 opacity-40" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
