'use client';

import { useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { format } from 'date-fns';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { defaultGridOptions, getGridTheme } from '@/config/ag-grid-config';
import { useThemeStore } from '@/stores/theme-store';
import { useVnbStore } from '@/stores/vnb-store';
import { useAssets } from './use-assets';
import { assetColDefs } from './asset-columns';
import type { RawAsset } from './assets.types';
import { displayValue, formatNumber } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Download, Zap, RefreshCw } from 'lucide-react';

// ── Extra cell renderers ──────────────────────────────────────────────────────

function FernsteuerbarkeitRenderer(params: ICellRendererParams<RawAsset>) {
  const val = params.value as string | boolean | null | undefined;
  if (val === null || val === undefined || val === '')
    return <span className="text-muted-foreground">–</span>;

  const isTrue =
    val === true || String(val).toLowerCase() === 'true' || String(val).toLowerCase() === 'ja';
  return isTrue ? (
    <Badge className="text-xs border-0 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
      Ja
    </Badge>
  ) : (
    <Badge className="text-xs border-0 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
      Nein
    </Badge>
  );
}

// ── Extended column definitions ───────────────────────────────────────────────

const redispatchExtraColDefs: ColDef<RawAsset>[] = [
  {
    headerName: 'DV-Fernsteuerbar',
    field: 'Fernsteuerbarkeit',
    width: 140,
    cellRenderer: FernsteuerbarkeitRenderer,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'Einspeiseart',
    field: 'Einspeisungsart',
    width: 150,
    filter: 'agTextColumnFilter',
    valueFormatter: (p) => displayValue(p.value as string | null),
  },
  {
    headerName: 'Einsatzverantwortlicher',
    field: 'Einsatzverantwortlicher',
    width: 200,
    filter: 'agTextColumnFilter',
    valueFormatter: (p) => displayValue(p.value as string | null),
  },
];

const colDefs: ColDef<RawAsset>[] = [...assetColDefs, ...redispatchExtraColDefs];

// ── KPI chips ─────────────────────────────────────────────────────────────────

interface KpiChipProps {
  label: string;
  value: string;
}

function KpiChip({ label, value }: KpiChipProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 shadow-sm">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

const SKELETON_WIDTHS = [180, 110, 120, 150, 80, 140, 130, 160, 160, 200, 130, 140, 150, 200];

function QueueSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-36 rounded-md" />
        ))}
      </div>
      <div className="space-y-2 overflow-x-auto">
        <div className="flex gap-2">
          {SKELETON_WIDTHS.map((w, i) => (
            <Skeleton key={i} className="h-11 shrink-0 rounded" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 10 }).map((_, row) => (
          <div key={row} className="flex gap-2">
            {SKELETON_WIDTHS.map((w, col) => (
              <Skeleton key={col} className="h-10 shrink-0 rounded" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RedispatchQueue() {
  const { bdewCode } = useVnbStore();
  const { resolvedTheme } = useThemeStore();
  const gridRef = useRef<AgGridReact>(null);

  const { data, isLoading, isError, refetch } = useAssets(
    { redispatchOnly: true, status: '35' },
    { refetchInterval: 60_000 },
  );

  const rows = data?.data ?? [];
  const isDark = resolvedTheme === 'dark';
  const theme = getGridTheme(isDark);

  // ── KPI calculations ────────────────────────────────────────────────────────

  const totalMW =
    rows.reduce((sum, r) => sum + (r['Leistung kW'] ?? 0), 0) / 1000;

  const typeCount = rows.reduce<Record<string, number>>((acc, r) => {
    const t = (r.Anlagentyp ?? '').toLowerCase();
    const key =
      t === 'solar' ? 'Solar' : t === 'wind' ? 'Wind' : 'Sonstige';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const fernsteuerbarCount = rows.filter((r) => {
    const v = String(r.Fernsteuerbarkeit ?? '').toLowerCase();
    return v === 'true' || v === 'ja';
  }).length;

  function handleExport() {
    const api = gridRef.current?.api;
    if (!api) return;
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    api.exportDataAsCsv({
      fileName: `redispatch-${bdewCode ?? 'export'}-${dateStr}.csv`,
    });
  }

  // ── States ──────────────────────────────────────────────────────────────────

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-destructive font-medium">
          Fehler beim Laden der Redispatch-Anlagen
        </p>
        <Button variant="outline" onClick={() => void refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Erneut versuchen
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <QueueSkeleton />;
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* KPI chips */}
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <KpiChip label="Gesamt Anlagen" value={rows.length.toLocaleString('de-DE')} />
        <KpiChip
          label="Gesamt MW"
          value={`${formatNumber(totalMW, { maximumFractionDigits: 1 })} MW`}
        />
        <KpiChip
          label="Solar / Wind / Sonstige"
          value={`${typeCount['Solar'] ?? 0} / ${typeCount['Wind'] ?? 0} / ${typeCount['Sonstige'] ?? 0}`}
        />
        <KpiChip
          label="DV-fernsteuerbar"
          value={`${fernsteuerbarCount} / ${rows.length}`}
        />

        <div className="flex-1" />

        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
          disabled={rows.length === 0}
          className="h-7 text-xs"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          CSV Export
        </Button>
      </div>

      {/* Grid */}
      <div className="flex-1 min-h-0 rounded-md border overflow-hidden">
        {rows.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={Zap}
              title="Keine Redispatch-Anlagen"
              description="Für den ausgewählten VNB wurden keine Anlagen ≥ 100 kW gefunden."
            />
          </div>
        ) : (
          <div className={`${theme} h-full w-full`}>
            <AgGridReact<RawAsset>
              ref={gridRef}
              rowData={rows}
              columnDefs={colDefs}
              {...defaultGridOptions}
              domLayout="normal"
              containerStyle={{ height: '100%', width: '100%' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
