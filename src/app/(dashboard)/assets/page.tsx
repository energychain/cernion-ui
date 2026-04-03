'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { GridApi, FilterModel } from 'ag-grid-community';
import { format } from 'date-fns';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { defaultGridOptions, getGridTheme } from '@/config/ag-grid-config';
import { useThemeStore } from '@/stores/theme-store';
import { useVnbStore } from '@/stores/vnb-store';
import { useAssets } from '@/features/assets/use-assets';
import {
  assetColDefs,
  ASSET_TYPE_OPTIONS,
  ASSET_STATUS_OPTIONS,
  SPANNUNGSEBENE_OPTIONS,
} from '@/features/assets/asset-columns';
import type { AssetQueryParams, AssetType } from '@/features/assets/assets.types';
import { getApiErrorMessage } from '@/lib/utils';

import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { PartialDataBanner } from '@/components/shared/partial-data-banner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, RefreshCw, Zap } from 'lucide-react';
import { RedispatchQueue } from '@/features/assets/redispatch-queue';

// ── Skeleton placeholder ──────────────────────────────────────────────────────

const SKELETON_WIDTHS = [180, 110, 120, 150, 80, 140, 130, 160, 160, 200, 130];

function GridSkeleton() {
  return (
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
  );
}

// ── Assets grid sub-component ─────────────────────────────────────────────────

function AssetsGrid() {
  const { bdewCode, name: vnbName } = useVnbStore();
  const { resolvedTheme } = useThemeStore();

  const [queryParams, setQueryParams] = useState<AssetQueryParams>({
    status: '35',
    redispatchOnly: false,
  });

  const [activeTypes, setActiveTypes] = useState<AssetType[]>([]);
  const [activeStatus, setActiveStatus] = useState<string>('35');
  const [activeSpannungsebene, setActiveSpannungsebene] = useState<string>('');

  const gridRef = useRef<AgGridReact>(null);

  const { data, isLoading, isError, error, refetch } = useAssets(queryParams);

  const rows = data?.data ?? [];
  const isDark = resolvedTheme === 'dark';
  const theme = getGridTheme(isDark);

  function applyClientFilters(types: AssetType[], spannungsebene: string) {
    const api: GridApi | undefined = gridRef.current?.api;
    if (!api) return;
    const filterModel: FilterModel = {};
    if (types.length > 0) {
      filterModel['Anlagentyp'] = {
        filterType: 'text',
        operator: 'OR',
        conditions: types.map((t) => ({
          filterType: 'text',
          type: 'contains',
          filter: t,
        })),
      };
    }
    if (spannungsebene) {
      filterModel['Spannungsebene NAP'] = {
        filterType: 'text',
        type: 'contains',
        filter: spannungsebene,
      };
    }
    api.setFilterModel(filterModel);
  }

  function handleTypeToggle(type: AssetType) {
    const next = activeTypes.includes(type)
      ? activeTypes.filter((t) => t !== type)
      : [...activeTypes, type];
    setActiveTypes(next);
    applyClientFilters(next, activeSpannungsebene);
  }

  function handleStatusChange(value: string) {
    setActiveStatus(value);
    setQueryParams((p) => ({ ...p, status: value === 'all' ? undefined : value }));
  }

  function handleSpannungsebeneChange(value: string) {
    const next = value === 'all' ? '' : value;
    setActiveSpannungsebene(next);
    applyClientFilters(activeTypes, next);
  }

  function handleRedispatchToggle() {
    setQueryParams((p) => ({ ...p, redispatchOnly: !p.redispatchOnly }));
  }

  function handleExport() {
    const api: GridApi | undefined = gridRef.current?.api;
    if (!api) return;
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    api.exportDataAsCsv({
      fileName: `assets-${bdewCode ?? 'export'}-${dateStr}.csv`,
    });
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-destructive font-medium">
          {getApiErrorMessage(error) ?? 'Fehler beim Laden der Anlagen'}
        </p>
        <Button variant="outline" onClick={() => void refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Erneut versuchen
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {data?._errors && data._errors.length > 0 && (
        <PartialDataBanner messages={data._errors} />
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium pr-1">Typ:</span>
          {ASSET_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleTypeToggle(opt.value)}
              className="focus:outline-none"
            >
              <Badge
                variant={activeTypes.includes(opt.value) ? 'default' : 'outline'}
                className="cursor-pointer text-xs px-2 py-0.5 hover:opacity-80 transition-opacity"
              >
                {opt.label}
              </Badge>
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-border" />

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Status:</span>
          <Select value={activeStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-7 text-xs w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSET_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Spannung:</span>
          <Select
            value={activeSpannungsebene || 'all'}
            onValueChange={handleSpannungsebeneChange}
          >
            <SelectTrigger className="h-7 text-xs w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Alle</SelectItem>
              {SPANNUNGSEBENE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-4 w-px bg-border" />

        <Button
          size="sm"
          variant={queryParams.redispatchOnly ? 'default' : 'outline'}
          onClick={handleRedispatchToggle}
          className="h-7 text-xs"
        >
          <Zap className="mr-1.5 h-3.5 w-3.5" />
          Redispatch ≥ 100 kW
        </Button>

        <div className="flex-1" />

        {!isLoading && (
          <span className="text-xs text-muted-foreground">
            {rows.length.toLocaleString('de-DE')} Anlagen
          </span>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
          disabled={isLoading || rows.length === 0}
          className="h-7 text-xs"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          CSV Export
        </Button>
      </div>

      {/* Grid */}
      <div className="flex-1 min-h-0 rounded-md border overflow-hidden">
        {isLoading ? (
          <div className="p-4 overflow-auto h-full">
            <GridSkeleton />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={Zap}
              title="Keine Anlagen gefunden"
              description={`Für ${vnbName ?? bdewCode ?? '–'} wurden keine Anlagen mit den aktuellen Filtereinstellungen gefunden.`}
            />
          </div>
        ) : (
          <div className={`${theme} h-full w-full`}>
            <AgGridReact<(typeof rows)[number]>
              ref={gridRef}
              rowData={rows}
              columnDefs={assetColDefs}
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

// ── Page component ────────────────────────────────────────────────────────────

type TabValue = 'assets' | 'redispatch';

export default function AssetsPage() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<TabValue>('assets');

  useEffect(() => {
    setMounted(true);
    const tab = searchParams.get('tab');
    if (tab === 'redispatch' || tab === 'assets') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = value as TabValue;
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tab);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const { bdewCode } = useVnbStore();

  if (mounted && !bdewCode) {
    return (
      <EmptyState
        icon={Zap}
        title="Kein VNB ausgewählt"
        description="Wähle oben einen Netzbetreiber aus, um die Anlagenliste zu laden."
      />
    );
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex flex-col h-[calc(100vh-8rem)] gap-3"
    >
      <TabsList className="self-start">
        <TabsTrigger value="assets">Anlagen</TabsTrigger>
        <TabsTrigger value="redispatch">Redispatch-Queue</TabsTrigger>
      </TabsList>

      <TabsContent value="assets" className="flex-1 min-h-0">
        {mounted && <AssetsGrid />}
      </TabsContent>

      <TabsContent value="redispatch" className="flex-1 min-h-0">
        {mounted && <RedispatchQueue />}
      </TabsContent>
    </Tabs>
  );
}
