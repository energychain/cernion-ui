# BR-0002 — vnb-lookup-codes + vnb-overview: 500 / Socket Hang-Up für Syna GmbH

**Typ:** Bug Report  
**Priorität:** High  
**Datum:** 2026-04-02  
**Status:** Resolved

---

## Zusammenfassung

Für den VNB **Syna GmbH** (BDEW-Code `9906311000005`) bricht der Backend-Server
die Verbindung mit einem Socket Hang-Up ab. Das Next.js-Proxy protokolliert
`Error: socket hang up` und liefert dem Frontend HTTP 500 zurück. Betroffen sind
**beide** Endpoints, die nach einer VNB-Auswahl aufgerufen werden:

- `POST /api/grid-operations/vnb-lookup-codes`
- `GET /api/dashboard/vnb-overview?bdewCode=9906311000005`

Da `9906311000005` vom Market-Partners-Endpoint `GET /api/grid-operations/market-partners?query=Syna`
als erstes Ergebnis geliefert wird, trifft der Nutzer diesen Fehler beim ersten
plausiblen Treffer.

---

## Schritte zur Reproduktion

1. Login mit gültigem Token
2. Im Header-VNB-Selektor „Syna" eingeben
3. Ersten Treffer „Syna GmbH | 9906311000005" auswählen
4. Dashboard lädt nicht — weiß (vor Fix) / Fehlermeldung (nach Fix)

---

## Beobachtetes Verhalten

```
Next.js Proxy-Log:
  Failed to proxy http://10.0.0.8:3900/api/grid-operations/vnb-lookup-codes Error: socket hang up
  Failed to proxy http://10.0.0.8:3900/api/dashboard/vnb-overview?bdewCode=9906311000005 Error: socket hang up
```

HTTP-Status gegenüber dem Frontend: **500 Internal Server Error**  
Response-Body: leer (kein JSON)

---

## Erwartetes Verhalten

Beide Endpoints sollten auch für unbekannte / nicht im System hinterlegte BDEW-Codes
eine strukturierte JSON-Antwort zurückgeben, z.B.:

```json
{
  "success": false,
  "error": {
    "code": "VNB_NOT_FOUND",
    "message": "BDEW-Code 9906311000005 ist im System nicht bekannt.",
    "bdewCode": "9906311000005"
  }
}
```

HTTP-Status: **404** (nicht gefunden) oder **422** (nicht verarbeitbar),
**niemals** 500 / Socket Hang-Up für fehlende Stammdaten.

---

## Kontext

- `market-partners` liefert `9906311000005` mit `mastrNetzbetreiberId: null` —
  der BDEW-Code ist also im System bekannt, aber nicht vollständig hinterlegt.
- Der Frontend-Fix (v0.20.3) fängt den 500 jetzt ab und zeigt eine Fehlermeldung
  mit „Anderen VNB auswählen"-Button. Das ist aber nur ein Workaround — das
  eigentliche Problem liegt im Backend.

---

## Betroffene Endpoints

| Endpoint | Methode | Status |
|---|---|---|
| `/api/grid-operations/vnb-lookup-codes` | POST | 500 / Socket Hang-Up |
| `/api/dashboard/vnb-overview` | GET | 500 / Socket Hang-Up |

---

## Resolution (vom Backend ausgefüllt)

**Bearbeitet:** 2026-04-02  
**Backend-Version:** 0.20.2  
**UI-Contract-Update:** Nein

### Root-Cause

`vnbLookupCodes` hatte kein Action-Timeout und erbte das globale Moleculer-Timeout
von 15 min. Der Next.js-Proxy schließt die TCP-Verbindung nach ~60 s → socket hang up
bevor der Node.js-Server eine HTTP-Antwort senden konnte.

### Backend-Fix

- `timeout: 30_000` auf der `vnbLookupCodes`-Action
- try/catch um MCP-Aufruf → strukturierter `503 VNB_LOOKUP_ERROR` statt 500 mit leerem Body
- Null-Guard für unbekannte BDEW-Codes → `404 VNB_NOT_FOUND` statt 500
- `vnbOverview` degradiert jetzt graceful: gibt `kpis: null` +
  `_errors: ["grid-operations.vnbLookupCodes"]` zurück statt 500

### Frontend-Folgeaktion (v0.20.2)

- `dashboard-overview.tsx`: `_errors`-Banner zeigt jetzt "VNB-Stammdaten nicht verfügbar"
  statt rohem Service-Namen (`grid-operations.vnbLookupCodes`)
- `lib/utils.ts`: `getApiErrorMessage()` ergänzt — extrahiert strukturierte Meldungen
  aus 422 / 503 / 404-Responses (auch für CR-0001)
- `dashboard-overview.tsx`: `isError`-Zustand nutzt `getApiErrorMessage()` zur
  Anzeige von Backend-Fehlermeldungen statt eines generischen Textes
