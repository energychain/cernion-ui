# Changelog

All notable changes to **Cernion Enterprise UI** are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versions align with [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Planned
- v0.20.2 — Market: ECharts spot prices, forecasts, residual load, CO₂
- v0.20.3 — Agents: MaStR-Quality, Grid-Connection, Energy-Sharing, Redispatch
- v0.20.4 — Datapoints: CRUD, health, snapshots, OE metadata
- v0.20.5 — Monitors: VNB-Monitor, NBP-Monitor, Gas Storage, EWK benchmarks
- v0.20.6 — Admin: Tokens, Jobs, System status
- v0.20.7 — Polish: Error Boundaries, Skeletons, Dark Mode, E2E tests

---

## [0.20.2] — 2026-04-02

### v0.20.2 — Hydration-Fixes + Backend-500-Handling (White Page)

### Fixed

#### Hydration (React 19 + Zustand persist)
Alle drei Komponenten, die Zustand-`persist`-Stores direkt rendern, hatten eine
React 19 Hydration-Mismatch: Der Server rendert mit dem Initialzustand (kein
`localStorage`), der Client rehydriert synchron aus `localStorage` — die
resultierenden Bäume weichen ab, React 19 bricht die Hydration ab und zeigt eine
weiße Seite ohne Fehlermeldung in der Konsole (nur `"connected"` vom HMR-Client).

- `app/(dashboard)/layout.tsx` — **Hauptursache**: SSR renderte Spinner
  (`isAuthenticated = false`), Client renderte volles Layout (`isAuthenticated = true`
  aus localStorage) → React 19 Hydration-Fehler → weiße Seite bei Reload.
  Mounted-Guard ergänzt; Auth-Redirect nur nach Mount ausgeführt.
- `features/dashboard/dashboard-overview.tsx` — Mounted-Guard für `bdewCode`.
- `components/layout/header.tsx` — Mounted-Guard für `bdewCode` in `VnbSelector`.
- `hooks/use-vnb-context.ts` — `useResolveVnbIdentity` las `data.canonical`
  direkt statt `envelope.data.canonical` → TypeError → Crash.
  `ApiEnvelope<T>`-Typ ergänzt.

#### Backend-500-Handling (Syna GmbH / Socket Hang-Up)
Für VNBs ohne vollständige Stammdaten (z.B. Syna GmbH, BDEW `9906311000005`)
bricht das Backend die Verbindung mit einem Socket Hang-Up ab → HTTP 500 mit
leerem Body. Das führte zu unbehandelten Promise-Rejections, die den gesamten
Komponentenbaum zum Absturz brachten (weiße Seite, keine Console-Fehlermeldung).

- `hooks/use-vnb-context.ts` — `useResolveVnbIdentity`: `retry: false` +
  `throwOnError: false` ergänzt; ein Backend-500 propagiert nicht mehr als
  Fehler in den Komponentenbaum.
- `features/dashboard/dashboard-overview.tsx` — `vnb-overview`-Query: ebenfalls
  `retry: false` + `throwOnError: false`; `isError`-Branch zeigt jetzt
  „Anderen VNB auswählen"-Button der `clearVnb()` aufruft.
- `components/layout/header.tsx` — `VnbSelector` in `<ErrorBoundary>` eingebettet;
  bei Crash wird kompakter roter „VNB-Fehler — klicken zum Zurücksetzen"-Button
  gezeigt der `clearVnb()` + ErrorBoundary-Reset aufruft.
- `feedback/BR-0002-vnb-lookup-codes-500-socket-hangup.md` — Bug Report erstellt.

#### Backend-Resolution RES-DR-0001 (market-snapshot region)
- `src/config/api-endpoints.ts` — Konstante `MARKET_SNAPSHOT_REGION = 'Germany'`
  ergänzt. ENTSO-E unterstützt ausschließlich länderbezogene Bidding-Zonen;
  sub-nationale Angaben (`"Bayern"` etc.) sind ungültig und liefern
  `renewableForecast24h: null`. Alle künftigen market-snapshot-Calls müssen
  diese Konstante verwenden.
- `src/stores/vnb-store.ts` — Irreführenden Kommentar am `region`-Feld korrigiert;
  das Feld dient nur der Anzeige und wird **nicht** als API-Parameter übergeben.
- `feedback/DR-0001-market-snapshot-region.md` — Status auf `resolved` gesetzt.

#### Backend-Resolution RES-BR-0002 (vnb-lookup-codes socket hang-up)
Backend: `timeout: 30_000` auf `vnbLookupCodes`-Action; MCP-Fehler → `503
VNB_LOOKUP_ERROR`; unbekannte BDEW-Codes → `404 VNB_NOT_FOUND`; `vnbOverview`
degradiert jetzt graceful (`kpis: null` + `_errors`) statt 500.

- `src/features/dashboard/dashboard-overview.tsx` — `_errors`-Banner mappt
  Service-Namen auf deutsche Labels (`"grid-operations.vnbLookupCodes"` →
  „VNB-Stammdaten nicht verfügbar").
- `src/features/dashboard/dashboard-overview.tsx` — `isError`-Zustand nutzt
  `getApiErrorMessage()` für strukturierte Backend-Fehlermeldungen.
- `feedback/BR-0002-vnb-lookup-codes-500-socket-hangup.md` — Status auf `resolved` gesetzt.

#### Backend-Resolution RES-CR-0001 (strukturierte 422 Validation-Errors)
Backend: Alle drei Dashboard-Actions mit Fastest-Validator `params`+Custom-Messages
ausgestattet. Format: `422 VALIDATION_ERROR` mit `data[].field` + `data[].message`.

- `src/types/ui.ts` — `ValidationFieldError`-Interface hinzugefügt.
- `src/lib/utils.ts` — `getApiErrorMessage()` hinzugefügt; extrahiert bei 422
  das erste `data[].message`, bei 503/404 die `message` aus dem Response-Body.
- `feedback/CR-0001-validation-error-details.md` — Feedback-Datei erstellt, Status `resolved`.

---

## [0.20.1] — 2026-04-01

### v0.20.1 — Feedback-System + VNB-Selektor-Fixes + Dashboard-Verbesserungen

### Added

#### Feedback-System
- `feedback/` Verzeichnis als strukturierter Kommunikationskanal Frontend→Backend
- `feedback/README.md` — Workflow-Beschreibung, Typ-Tabelle, Nummerierungsregeln
- `feedback/TEMPLATE.md` — Vorlage für neue Feedback-Dateien (BR/CR/IR/DR)
- `feedback/BR-0001-vnb-bdew-null-kpis.md` — Bug: TWL Netze hat zwei BDEW-Codes;
  veralteter Code `9904350000002` (mastrId: null) wird bevorzugt geliefert
- `feedback/CR-0001-validation-error-details.md` — Change: Strukturierte
  Validierungsfehler mit `field`, `message`, `example`, `received`
- `feedback/IR-0001-redispatch-eligible-null.md` — Info: `redispatchEligible`
  ist permanent null; Klärung welche Implementierungsoption gewählt wird
- `feedback/DR-0001-market-snapshot-region.md` — Doku: `region`-Default in
  `market-snapshot` widerspricht v0.19.1-Verhalten
- `.github/copilot-instructions.md` — Copilot-Instructions mit Feedback-Verweis

#### Shared Components
- `components/shared/vnb-conflict-dialog.tsx` — Dialog zur Auflösung von
  BDEW-Konflikten; zeigt Kandidaten mit MaStR-ID, ermöglicht direkten Wechsel

### Changed

#### Hooks & Stores
- `hooks/use-vnb-context.ts` — `useResolveVnbIdentity(bdewCode)` Hook hinzugefügt:
  POST `/api/grid-operations/vnb-lookup-codes` nach VNB-Auswahl, liefert
  `resolved`, `mastrId`, `conflictFlags`, `candidates`; exportiert neue
  Interfaces `VnbLookupCodesResponse`, `ResolvedVnbIdentity`
- `stores/vnb-store.ts` — `region: string | null` Feld ergänzt (abgeleitet aus
  `market-partners` city); `setVnb()` nimmt optionales `region`-Argument;
  `clearVnb()` setzt auch `region` zurück; persistiert in `cernion-vnb`
- `config/api-endpoints.ts` — `VNB_LOOKUP_CODES` Konstante ergänzt

#### Layout
- `components/layout/header.tsx` — VNB-Selector prüft nach Auswahl via
  `useResolveVnbIdentity`, ob `mastrId` vorhanden ist; bei `mastrId: null`
  gelbe Warnung unterhalb des Inputs (klickbar → öffnet `VnbConflictDialog`);
  Input erhält gelben Rand; `city` aus Market-Partners wird an `setVnb` übergeben

#### Dashboard
- `features/dashboard/dashboard-overview.tsx`:
  - `redispatchEligible` KPI-Card wird ausgeblendet wenn Wert `null` ist
    (verhindert Lücke im Grid; per UI-Contract `null = hide card`)
  - Prominenter gelber Banner wenn `identity.mastrId` null und
    `vnb-lookup-codes` Auflösung gescheitert ist; Banner enthält BDEW-Code
    und optionalen „Andere BDEW-Codes anzeigen"-Button bei `conflictFlags`
  - `VnbConflictDialog` auch im Dashboard integriert
  - `InlineVnbPicker` übergibt `city` als `region` an `setVnb`

---

## [0.20.0] — 2026-03-31

### Planned
- v0.20.1 — Assets: AG Grid table, map, redispatch queue
- v0.20.2 — Market: ECharts spot prices, forecasts, residual load, CO₂
- v0.20.3 — Agents: MaStR-Quality, Grid-Connection, Energy-Sharing, Redispatch
- v0.20.4 — Datapoints: CRUD, health, snapshots, OE metadata
- v0.20.5 — Monitors: VNB-Monitor, NBP-Monitor, Gas Storage, EWK benchmarks
- v0.20.6 — Admin: Tokens, Jobs, System status
- v0.20.7 — Polish: Error Boundaries, Skeletons, Dark Mode, E2E tests

---

## [0.20.0] — 2026-03-31

### v0.20.0 — Skeleton: Project Setup, Auth, Layout, API-Client, VNB-Selector

Initial release of the Cernion Enterprise UI scaffold.

### Added

#### Infrastructure
- Next.js 16 (App Router, Turbopack) with TypeScript `strict: true`
- Tailwind CSS v4 with full CSS-variable theme system (light + dark)
- shadcn/ui component library (button, card, input, label, badge, separator,
  tooltip, popover, select, dialog, dropdown-menu, sheet, command, scroll-area,
  skeleton)
- Dev server on port **3901**; API base URL `http://10.0.0.8:3900` via `.env.local`
- TypeScript types auto-generated from `openapi-export.json` → `src/types/api.ts`
  (12 000+ lines, full backend coverage)

#### Core Libraries
- `@tanstack/react-query` v5 — all data fetching, no `useEffect` for data
- `zustand` v5 — global state (auth, VNB context, theme, API log)
- `axios` — single `lib/api-client.ts` instance with interceptors
- `sonner` — toast notifications for mutations
- `date-fns` v4 (de locale) — all date formatting
- `echarts` + `echarts-for-react` — charts (used from v0.20.2)
- `ag-grid-community` + `ag-grid-react` — data grid (used from v0.20.1)
- `react-leaflet` + `leaflet` — maps (used from v0.20.1)
- `react-hook-form` + `zod` + `@hookform/resolvers` — forms

#### API Client (`src/lib/api-client.ts`)
- Axios instance with `baseURL = NEXT_PUBLIC_API_URL`
- Request interceptor: Bearer token injection from `localStorage`
- Request interceptor: Start-time metadata for latency tracking
- Response interceptor: API-Inspector logging (stores last 50 calls)
- Response interceptor: 401 → clear token + redirect to `/login`

#### Stores
- `auth-store.ts` — token, `isAuthenticated`, scope (`read-only` / `full-access`)
- `vnb-store.ts` — selected VNB (BDEW code, MaStR-ID, name); persisted
- `theme-store.ts` — `light` / `dark` / `system`; persisted
- `api-log-store.ts` — ring buffer (50 entries) for API Inspector

#### Hooks
- `use-api-client.ts` — thin wrapper exposing `get`, `post`, `put`, `del`
- `use-auth.ts` — login mutation (`POST /api/tokens/verify`), logout
- `use-vnb-context.ts` — VNB store accessor + `useMarketPartnerSearch` query
- `use-permission.ts` — RBAC scope check
- `use-job-polling.ts` — async job status + result polling (2 s interval, 2 min max)

#### Config
- `config/api-endpoints.ts` — 40+ endpoint constants
- `config/menu.ts` — sidebar navigation tree with RBAC `requiredScope`
- `config/thresholds.ts` — KPI threshold configs + `getThresholdState()` helper

#### Layout Components
- `layout/providers.tsx` — `QueryClientProvider` + `ThemeApplier`
- `layout/sidebar.tsx` — collapsible sidebar (240 px / 56 px), active state,
  nested nav with expand/collapse, RBAC-filtered items
- `layout/header.tsx` — VNB selector (Combobox, `GET /api/grid-operations/market-partners`,
  min. 2 chars), theme toggle (light/dark/system), user menu with logout
- `layout/breadcrumbs.tsx` — auto-generated from URL path segments
- `layout/api-inspector.tsx` — floating action button + Sheet slide-over,
  colour-coded by method and HTTP status, latency display

#### Shared Components
- `shared/severity-chip.tsx` — CRITICAL / HIGH / MEDIUM / LOW / INFO badges
- `shared/decision-badge.tsx` — GO / NO_GO / APPROVED / PENDING / ERROR badges
- `shared/kpi-card.tsx` — value card with threshold colouring, trend arrow, icon
- `shared/findings-table.tsx` — sortable findings table, skeleton loading
- `shared/step-timeline.tsx` — pipeline step visualisation (vertical + horizontal)
- `shared/job-progress.tsx` — live job status indicator via polling hook
- `shared/partial-data-banner.tsx` — `_errors` warning banner
- `shared/empty-state.tsx` — empty state + `ComingSoon` with deadline countdown
- `shared/confirm-dialog.tsx` — confirmation dialog for destructive actions
- `shared/error-boundary.tsx` — React class error boundary, isolates widget crashes

#### App Routes
| Route | Status |
|---|---|
| `/login` | ✅ Token input with show/hide, `POST /api/tokens/verify` |
| `/` (Dashboard) | ✅ VNB-Overview: KPI cards, agent results, alerts |
| `/market` | 🔜 Stub — v0.20.2 |
| `/quality` | 🔜 Stub — v0.20.3 |
| `/quality/mastr-audit` | 🔜 Stub — v0.20.3 |
| `/quality/grid-connection` | 🔜 Stub — v0.20.3 |
| `/quality/energy-sharing` | 🔜 Stub — v0.20.3 (⚠ §42c deadline 01.06.2026) |
| `/quality/allocation` | 🔜 Stub — v0.20.3 |
| `/quality/redispatch` | 🔜 Stub — v0.20.3 |
| `/assets` | 🔜 Stub — v0.20.1 |
| `/datapoints` | 🔜 Stub — v0.20.4 |
| `/monitors/vnb` | 🔜 Stub — v0.20.5 |
| `/monitors/nbp` | 🔜 Stub — v0.20.5 |
| `/admin/tokens` | 🔜 Stub — v0.20.6 |
| `/admin/jobs` | 🔜 Stub — v0.20.6 |
| `/admin/system` | 🔜 Stub — v0.20.6 |

#### Developer Experience
- `lib/utils.ts` — `cn()`, `displayValue()`, `formatNumber/Percent/Currency/
  Capacity/EnergyPrice/Date/DateTime/Relative()`, severity helpers, `debounce()`, `uid()`
- `lib/constants.ts` — app-wide constants, severity/decision colours
- `types/ui.ts` — all UI-specific TypeScript interfaces
- `.env.local` — `NEXT_PUBLIC_API_URL=http://10.0.0.8:3900`

### Conventions enforced
1. ✅ No `any` — TypeScript `strict: true`
2. ✅ No `useEffect` for data fetching — React Query only
3. ✅ No custom CSS files — Tailwind + CSS variables
4. ✅ No direct `fetch()` — all via `lib/api-client.ts`
5. ✅ No inline styles
6. ✅ Skeleton states on all data-loading components
7. ✅ Toast on mutations (login, logout)
8. ✅ Null fields → `–` via `displayValue()`
9. ✅ Error boundaries — `ErrorBoundary` + `WithErrorBoundary` wrapper
10. ✅ Dark mode — CSS variables + `dark:` Tailwind prefix throughout

---

[Unreleased]: https://github.com/your-org/cernion-ui/compare/v0.20.0...HEAD
[0.20.0]: https://github.com/your-org/cernion-ui/releases/tag/v0.20.0
