'use client';

import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDate, displayValue } from '@/lib/utils';
import type { RawAsset, AssetType } from './assets.types';

// ── Type Badge ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  solar: 'Solar',
  wind: 'Wind',
  storage: 'Speicher',
  biomass: 'Biomasse',
  combustion: 'KWK',
  hydro: 'Wasser',
  other: 'Sonstige',
};

const TYPE_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  solar: 'default',
  wind: 'secondary',
  storage: 'default',
  biomass: 'secondary',
  combustion: 'outline',
  hydro: 'secondary',
  other: 'outline',
};

// Extra colour classes applied on top of the variant
const TYPE_EXTRA_CLASSES: Record<string, string> = {
  solar: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  wind: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  storage: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  biomass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
  combustion: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  hydro: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  other: '',
};

function TypeBadgeRenderer(params: ICellRendererParams<RawAsset>) {
  const raw = (params.value as string | null | undefined)?.toLowerCase() ?? '';
  const label = TYPE_LABELS[raw] ?? displayValue(params.value);
  const variant = TYPE_VARIANTS[raw] ?? 'outline';
  const extra = TYPE_EXTRA_CLASSES[raw] ?? '';
  return (
    <Badge variant={variant} className={`text-xs font-medium ${extra}`}>
      {label}
    </Badge>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────

const STATUS_CLASSES: Record<string, string> = {
  '35': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  '31': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  '37': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  '38': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const STATUS_FALLBACK_CLASS =
  'bg-muted text-muted-foreground';

function StatusBadgeRenderer(params: ICellRendererParams<RawAsset>) {
  // params.data holds the full row; params.value is the cell value
  const code = params.data?.Betriebsstatus ?? '';
  const label = displayValue(params.value);
  const cls = STATUS_CLASSES[code] ?? STATUS_FALLBACK_CLASS;
  return (
    <Badge variant="outline" className={`text-xs font-medium border-0 ${cls}`}>
      {label}
    </Badge>
  );
}

// ── NBP Status Badge ──────────────────────────────────────────────────────────

const NBP_STATUS_CLASSES: Record<number, string> = {
  2954: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  2955: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  3075: 'bg-muted text-muted-foreground',
};

function NBPStatusRenderer(params: ICellRendererParams<RawAsset>) {
  const code = params.data?.['Netzbetreiberpruefung Status'];
  const label = displayValue(params.value);
  const cls =
    code != null ? (NBP_STATUS_CLASSES[code] ?? 'bg-muted text-muted-foreground') : '';
  if (!params.value) return <span className="text-muted-foreground">–</span>;
  return (
    <Badge variant="outline" className={`text-xs font-medium border-0 ${cls}`}>
      {label}
    </Badge>
  );
}

// ── MaStR link cell ───────────────────────────────────────────────────────────

function MastrLinkRenderer(params: ICellRendererParams<RawAsset>) {
  const id = params.value as string | null | undefined;
  if (!id) return <span className="text-muted-foreground">–</span>;
  return (
    <a
      href={`https://www.marktstammdatenregister.de/MaStR/Einheit/Detail/IndexOeffentlich/${id}`}
      target="_blank"
      rel="noreferrer"
      className="font-mono text-xs text-primary underline-offset-2 hover:underline"
    >
      {id}
    </a>
  );
}

// ── Monospace cell ────────────────────────────────────────────────────────────

function MonoRenderer(params: ICellRendererParams<RawAsset>) {
  const val = params.value as string | null | undefined;
  if (!val) return <span className="text-muted-foreground">–</span>;
  return <span className="font-mono text-xs">{val}</span>;
}

// ── MeLo cell with tooltip ────────────────────────────────────────────────────

function MeLoRenderer(params: ICellRendererParams<RawAsset>) {
  const val = params.value as string | null | undefined;
  if (!val) return <span className="text-muted-foreground">–</span>;
  const truncated = val.length > 18 ? `${val.slice(0, 18)}…` : val;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="font-mono text-xs cursor-default">{truncated}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="font-mono text-xs max-w-xs break-all">
        {val}
      </TooltipContent>
    </Tooltip>
  );
}

// ── Date cell ─────────────────────────────────────────────────────────────────

function DateRenderer(params: ICellRendererParams<RawAsset>) {
  return <span className="text-sm">{formatDate(params.value as string)}</span>;
}

// ── Column definitions ────────────────────────────────────────────────────────

export const assetColDefs: ColDef<RawAsset>[] = [
  {
    headerName: 'MaStR-Nr',
    field: 'SEE Nummer',
    width: 180,
    cellRenderer: MastrLinkRenderer,
    filter: 'agTextColumnFilter',
    pinned: 'left',
  },
  {
    headerName: 'Typ',
    field: 'Anlagentyp',
    width: 110,
    cellRenderer: TypeBadgeRenderer,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'Kapazität',
    field: 'Leistung kW',
    width: 120,
    type: 'numericColumn',
    filter: 'agNumberColumnFilter',
    valueFormatter: (p) => {
      const kw = p.value as number | null | undefined;
      if (kw == null) return '–';
      if (kw >= 1000)
        return `${(kw / 1000).toLocaleString('de-DE', { maximumFractionDigits: 2 })} MW`;
      return `${kw.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kW`;
    },
  },
  {
    headerName: 'Status',
    field: 'Betriebsstatus Name',
    width: 150,
    cellRenderer: StatusBadgeRenderer,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'PLZ',
    field: 'Postleitzahl',
    width: 80,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'Ort',
    field: 'Ort',
    width: 140,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'Inbetriebnahme',
    field: 'Datum Netzzugang',
    width: 130,
    cellRenderer: DateRenderer,
    filter: 'agDateColumnFilter',
    comparator: (a: string, b: string) =>
      (a ?? '').localeCompare(b ?? ''),
  },
  {
    headerName: 'NBP-Status',
    field: 'Netzbetreiberpruefung Status Name',
    width: 160,
    cellRenderer: NBPStatusRenderer,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'NAP',
    field: 'NAP MaStR Nummer',
    width: 160,
    cellRenderer: MonoRenderer,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'MeLo',
    field: 'Messlokation (MeLo)',
    width: 200,
    cellRenderer: MeLoRenderer,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'Spannungsebene',
    field: 'Spannungsebene NAP',
    width: 130,
    filter: 'agTextColumnFilter',
  },
];

// Re-export the per-field AssetType list for filter chips
export const ASSET_TYPE_OPTIONS: Array<{ value: AssetType; label: string }> = [
  { value: 'solar', label: 'Solar' },
  { value: 'wind', label: 'Wind' },
  { value: 'storage', label: 'Speicher' },
  { value: 'biomass', label: 'Biomasse' },
  { value: 'combustion', label: 'KWK' },
  { value: 'hydro', label: 'Wasser' },
];

export const ASSET_STATUS_OPTIONS = [
  { value: '35', label: 'In Betrieb' },
  { value: '31', label: 'In Planung' },
  { value: '37', label: 'Temp. stillgelegt' },
  { value: '38', label: 'Stillgelegt' },
  { value: 'all', label: 'Alle Status' },
];

export const SPANNUNGSEBENE_OPTIONS = [
  { value: 'Niederspannung', label: 'NS' },
  { value: 'Mittelspannung', label: 'MS' },
  { value: 'Hochspannung', label: 'HS' },
  { value: 'Höchstspannung', label: 'EHS' },
];
