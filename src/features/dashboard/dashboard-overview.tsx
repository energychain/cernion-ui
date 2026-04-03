'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/hooks/use-api-client';
import { useVnbContext, useResolveVnbIdentity } from '@/hooks/use-vnb-context';
import { API } from '@/config/api-endpoints';
import { STALE_TIME_MEDIUM } from '@/lib/constants';
import { KpiCard } from '@/components/shared/kpi-card';
import { PartialDataBanner } from '@/components/shared/partial-data-banner';
import { EmptyState } from '@/components/shared/empty-state';
import { VnbConflictDialog } from '@/components/shared/vnb-conflict-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SeverityChip } from '@/components/shared/severity-chip';
import { DecisionBadge } from '@/components/shared/decision-badge';
import { formatDateTime, displayValue, getApiErrorMessage } from '@/lib/utils';
import {
  AlertTriangle,
  Activity,
  Building2,
  Zap,
  CheckCircle2,
  Database,
  Search,
  Check,
} from 'lucide-react';
import type { Severity, DecisionStatus } from '@/types/ui';
import { useRef, useState, useEffect } from 'react';
import { useMarketPartnerSearch } from '@/hooks/use-vnb-context';
import type { ResolvedVnbIdentity } from '@/hooks/use-vnb-context';

interface AgentResult {
  decision?: string;
  findingCount?: number | null;
  lastRunAt?: string | null;
  score?: number | null;
}

interface VnbOverviewResponse {
  identity?: {
    name?: string | null;
    mastrId?: string | null;
    bdew?: string | null;
    bnr?: string | null;
  };
  kpis?: {
    totalInstallations?: number | null;
    totalCapacityMW?: number | null;
    redispatchEligible?: number | null;
    ewkAnschlussdauerWeeks?: number | null;
    ewkDigitalisierungsScore?: number | null;
    ewkUmsetzungsquote?: number | null;
    mastrQualityScore?: number | null;
    datapointsHealthy?: number | null;
    datapointsStale?: number | null;
    datapointsErrored?: number | null;
  };
  latestAgentResults?: {
    mastrQuality?: AgentResult | null;
    gridConnection?: AgentResult | null;
    energySharing?: AgentResult | null;
    redispatch?: AgentResult | null;
    [key: string]: AgentResult | null | undefined;
  };
  alerts?: Array<{
    severity: string;
    message: string;
    message_en?: string;
    code?: string;
    group?: string;
    currentValue?: number | null;
    threshold?: number | null;
    recommendation?: string;
    ewkImpact?: boolean;
  }>;
  timestamp?: string;
  _errors?: string[];
}

const AGENT_LABELS: Record<string, string> = {
  mastrQuality: 'MaStR-Qualität',
  gridConnection: 'Netzanschluss',
  energySharing: 'Gemeinschaftl. Erzeugung',
  redispatch: 'Redispatch 2.0',
};

/**
 * Human-readable labels for service names appearing in vnb-overview._errors.
 * Backend now returns structured errors instead of 500 socket hang-ups (RES-BR-0002).
 */
const SERVICE_LABELS: Record<string, string> = {
  'grid-operations.vnbLookupCodes': 'VNB-Stammdaten nicht verfügbar',
  'energy-market.prices':           'Strommarktdaten nicht verfügbar',
  'entsoe.windSolarForecast':        'Erneuerbaren-Prognose nicht verfügbar',
  'datapoint.health':                'Datenpunkt-Status nicht verfügbar',
};

/** Target routes for each agent result card. */
const AGENT_HREFS: Record<string, string> = {
  mastrQuality:   '/quality/mastr-audit',
  gridConnection: '/quality/grid-connection',
  energySharing:  '/quality/energy-sharing',
  redispatch:     '/quality/redispatch',
};

function InlineVnbPicker() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { setVnb } = useVnbContext();
  const { data: partners, isLoading } = useMarketPartnerSearch(query);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  const select = (bdew: string, mastr: string, n: string, city?: string) => {
    setVnb(bdew, mastr, n, city);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-72" onBlur={handleBlur}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          placeholder="BDEW-Code oder Name suchen…"
          autoFocus
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 mt-2 w-80 rounded-md border bg-popover shadow-lg overflow-hidden">
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
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <Check className="h-3.5 w-3.5 shrink-0 opacity-0" />
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

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56 rounded" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
    </div>
  );
}

export function DashboardOverview() {
  const { bdewCode: storedBdewCode, name, setVnb, clearVnb } = useVnbContext();
  const { get } = useApiClient();
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);

  // Guard against SSR/CSR hydration mismatch: Zustand persist loads from
  // localStorage synchronously on the client but is unavailable on the server.
  // Defer bdewCode until after mount so the first client render matches the
  // server-rendered HTML (both see null → empty state), preventing React 19
  // hydration errors that would otherwise leave a blank page after reload.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const bdewCode = mounted ? storedBdewCode : null;

  const { data: resolvedIdentity } = useResolveVnbIdentity(bdewCode);
  const mastrIdMissing = resolvedIdentity && !resolvedIdentity.resolved;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard-vnb-overview', bdewCode],
    queryFn: () =>
      get<VnbOverviewResponse>(API.DASHBOARD_VNB_OVERVIEW, {
        params: { bdewCode },
      }),
    staleTime: STALE_TIME_MEDIUM,
    enabled: !!bdewCode,
    retry: false,
    throwOnError: false,
  });

  // No VNB selected yet — show welcome/onboarding state
  if (!bdewCode) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-24 text-center text-muted-foreground">
        <Building2 className="w-12 h-12 opacity-30" />
        <div>
          <p className="text-lg font-semibold text-foreground">Kein VNB ausgewählt</p>
          <p className="text-sm mt-1 max-w-xs">
            Suche nach einem Verteilnetzbetreiber, um das Dashboard zu laden.
          </p>
        </div>
        <InlineVnbPicker />
      </div>
    );
  }

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Dashboard nicht verfügbar"
        description={getApiErrorMessage(error, 'Die VNB-Übersicht konnte nicht geladen werden. Möglicherweise wird dieser VNB nicht unterstützt.')}
        action={
          <button
            type="button"
            onClick={() => { clearVnb(); }}
            className="mt-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            Anderen VNB auswählen
          </button>
        }
      />
    );
  }

  const kpis = data?.kpis;
  const agentResultsObj = data?.latestAgentResults ?? {};
  const agentEntries = Object.entries(agentResultsObj) as [string, AgentResult | null][];
  const alerts = data?.alerts ?? [];
  const errors = data?._errors;
  const displayName = name ?? data?.identity?.name ?? 'Dashboard';
  const displayBdew = bdewCode ?? data?.identity?.bdew;

  // Use identity from API response if store-resolved identity is null
  const apiMastrId = data?.identity?.mastrId;
  const showMastrIdBanner =
    mastrIdMissing && !apiMastrId && !!resolvedIdentity;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
          {displayBdew && (
            <p className="text-sm text-muted-foreground mt-0.5">BDEW {displayBdew}</p>
          )}
        </div>
      </div>

      {/* MaStR-ID missing banner */}
      {showMastrIdBanner && resolvedIdentity && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-400 bg-yellow-50 px-4 py-3 dark:border-yellow-700 dark:bg-yellow-950">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
          <div className="min-w-0 flex-1 text-sm text-yellow-800 dark:text-yellow-300">
            <p className="font-medium">VNB-Identität konnte nicht vollständig aufgelöst werden.</p>
            <p className="mt-0.5">
              BDEW{' '}
              <code className="rounded bg-yellow-100 px-1 py-0.5 font-mono text-xs dark:bg-yellow-900">
                {resolvedIdentity.bdewCode}
              </code>{' '}
              hat keine zugeordnete MaStR-ID. KPI-Daten sind möglicherweise unvollständig.
            </p>
          </div>
          {resolvedIdentity.conflictFlags.includes('multiple_strong_bdew_codes') && (
            <button
              type="button"
              onClick={() => setConflictDialogOpen(true)}
              className="shrink-0 rounded-md border border-yellow-400 bg-white px-2.5 py-1 text-xs font-medium text-yellow-800 hover:bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800 transition-colors"
            >
              Andere BDEW-Codes anzeigen
            </button>
          )}
        </div>
      )}

      {/* Partial data warning from _errors */}
      {errors && errors.length > 0 && (
        <PartialDataBanner
          sources={errors}
          messages={errors.map((e) => SERVICE_LABELS[e] ?? e)}
        />
      )}

      {/* KPI Cards — redispatchEligible hidden when null (null = feature not supported by backend version) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard
          label="Anlagen gesamt"
          value={kpis?.totalInstallations ?? null}
          format="number"
          icon={Zap}
          href="/assets"
        />
        <KpiCard
          label="Nennleistung"
          value={kpis?.totalCapacityMW ?? null}
          unit="MW"
          format="number"
          icon={Activity}
          href="/assets"
        />
        <KpiCard
          label="MaStR-Score"
          value={kpis?.mastrQualityScore ?? null}
          unit="%"
          format="percent"
          threshold={{ warning: 80, critical: 60, direction: 'below' }}
          href="/quality/mastr-audit"
        />
        {kpis?.redispatchEligible != null && (
          <KpiCard
            label="Redispatch-Anlagen"
            value={kpis.redispatchEligible}
            format="number"
            threshold={{ warning: 5, critical: 20, direction: 'above' }}
            href="/assets?tab=redispatch"
          />
        )}
        <KpiCard
          label="Datenpunkte OK"
          value={kpis?.datapointsHealthy ?? null}
          format="number"
          icon={Database}
          threshold={{ warning: 1, critical: 0, direction: 'below' }}
          href="/datapoints"
        />
        <KpiCard
          label="Datenpunkte Stale"
          value={kpis?.datapointsStale ?? null}
          format="number"
          icon={Database}
          threshold={{ warning: 1, critical: 5, direction: 'above' }}
          href="/datapoints?status=stale"
        />
        <KpiCard
          label="Datenpunkte Fehler"
          value={kpis?.datapointsErrored ?? null}
          format="number"
          icon={Database}
          threshold={{ warning: 1, critical: 3, direction: 'above' }}
          href="/datapoints?status=errored"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Agent Results */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Agenten-Ergebnisse
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agentEntries.length === 0 ? (
              <EmptyState description="Noch keine Agenten-Läufe vorhanden." className="py-6" />
            ) : (
              <div className="space-y-2">
                {agentEntries.map(([key, result]) => {
                  const agentHref = AGENT_HREFS[key];
                  const rowContent = (
                    <>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {AGENT_LABELS[key] ?? key}
                        </p>
                        {result?.lastRunAt && (
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(result.lastRunAt)}
                            {result.findingCount != null && ` · ${result.findingCount} Findings`}
                          </p>
                        )}
                      </div>
                      {result ? (
                        <DecisionBadge decision={result.decision as DecisionStatus} />
                      ) : (
                        <span className="text-xs text-muted-foreground">Noch nicht ausgeführt</span>
                      )}
                    </>
                  );

                  if (agentHref) {
                    return (
                      <Link
                        key={key}
                        href={agentHref}
                        className="flex items-center justify-between rounded-lg border border-border p-2.5 cursor-pointer hover:bg-accent/50 transition-colors"
                      >
                        {rowContent}
                      </Link>
                    );
                  }
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-lg border border-border p-2.5"
                    >
                      {rowContent}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Aktive Alerts
              {alerts.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {alerts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                description="Keine aktiven Alerts — alles in Ordnung."
                className="py-6"
              />
            ) : (
              <div className="space-y-2">
                {alerts.map((alert, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg border border-border p-2.5"
                  >
                    <SeverityChip severity={alert.severity as Severity} />
                    <div className="min-w-0">
                      <p className="text-sm leading-snug">{displayValue(alert.message)}</p>
                      {alert.recommendation && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {alert.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conflict dialog for dashboard banner */}
      {showMastrIdBanner && resolvedIdentity && (
        <VnbConflictDialog
          open={conflictDialogOpen}
          onOpenChange={setConflictDialogOpen}
          identity={resolvedIdentity as ResolvedVnbIdentity}
          onSelectCandidate={(bdew, mastr, n) => setVnb(bdew, mastr, n)}
        />
      )}
    </div>
  );
}
