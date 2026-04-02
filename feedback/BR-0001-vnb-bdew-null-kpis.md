# BR-0001: vnb-overview liefert null-KPIs für TWL Netze

**Typ:** Bug Report
**Erstellt:** 2026-04-01
**Status:** open
**Priorität:** high
**Betrifft:** `01-dashboard-overview.md`
**Backend-Version:** 0.19.1
**Frontend-Version:** 0.20.0

---

## Kontext

VNB-Selector (Combobox mit `GET /api/grid-operations/market-partners?query=TWL Netze`)
liefert TWL Netze mit BDEW-Code `9904350000002`. Das Dashboard zeigt alle KPIs als „–".

## Problem

`GET /api/dashboard/vnb-overview?bdewCode=9904350000002` liefert:
- `identity.name`: null (oder „TWL Netze GmbH" ohne MaStR-ID)
- `kpis.totalInstallations`: null
- `kpis.ewkAnschlussdauerWeeks`: null
- Alle `latestAgentResults`: null

**Root Cause (verifiziert):**
TWL Netze hat zwei BDEW-Codes:
- `9907473000008` — korrekt (primary, `mastrId: SNB935578300972`)
- `9904350000002` — veraltet (candidate, `mastrId: null`)

`vnb_lookup_codes` per Name liefert den veralteten Code zuerst (Quelle: `market_partners`),
weil die Marktpartner-DB keine MaStR-ID-Auflösung macht. Der korrekte Code wird nur bei
direkter BDEW-Abfrage über den `mongodb-cache` gefunden.

`conflictFlags: ["multiple_strong_bdew_codes", "ambiguous_candidates"]` bestätigen die
Ambiguität.

## Erwartung

`vnb_lookup_codes` soll bei name-basierter Suche den BDEW-Code bevorzugen, der eine
MaStR-ID hat. Ein BDEW ohne MaStR-ID ist für die Dashboard-API wertlos — alle
nachgelagerten Calls brauchen `gridOperatorId` (= MaStR-ID).

## Vorschlag

In `grid-operations.vnbLookupCodes`: Wenn mehrere BDEW-Codes für denselben VNB-Namen
gefunden werden, sortiere nach:
1. Hat MaStR-ID? → bevorzugen
2. Quelle `mongodb-cache` → höhere Konfidenz als `market_partners`
3. Bei Gleichstand: BDEW mit höherer Installationszahl in der lokalen MongoDB bevorzugen

## Reproduktion

```bash
# Name-basiert → falscher Code
curl -X POST http://10.0.0.8:3900/api/grid-operations/vnb-lookup-codes \
  -H "Content-Type: application/json" \
  -d '{"vnbName":"TWL Netze","includeAliases":true}'
# → bdewCodePrimary: "9904350000002", mastrId: null

# BDEW-basiert → korrekter Code
curl -X POST http://10.0.0.8:3900/api/grid-operations/vnb-lookup-codes \
  -H "Content-Type: application/json" \
  -d '{"bdewCode":"9907473000008","includeAliases":true}'
# → bdewCodePrimary: "9907473000008", mastrId: "SNB935578300972"
```

---

## Resolution (vom Backend ausgefüllt)

**Bearbeitet:** —
**Lösung:** —
**Backend-Version:** —
**UI-Contract-Update:** —
