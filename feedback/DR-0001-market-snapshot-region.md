# DR-0001: market-snapshot `region`-Parameter — fehlende Dokumentation des Pflichtfeldes

**Typ:** Documentation Request
**Erstellt:** 2026-03-28
**Status:** resolved
**Priorität:** medium
**Betrifft:** `02-market-snapshot.md`
**Backend-Version:** 0.20.x
**Frontend-Version:** 0.20.1

---

## Kontext

Bei der Implementierung der Market-Snapshot-Integration (v0.20.1) war unklar,
ob der `region`-Parameter einen serverseitigen Default besitzt und ob
sub-nationale Regionen (z. B. `Bayern`) gültige Werte sind.

## Problem / Frage / Anforderung

Der UI-Contract `02-market-snapshot.md` dokumentierte nicht:

1. Dass `region` **kein serverseitiges Default** hat und bei fehlendem Wert
   `renewableForecast24h: null` zurückliefert.
2. Dass ENTSO-E ausschließlich **länderbezogene Bidding-Zonen** unterstützt —
   sub-nationale Angaben wie `"Bayern"` sind ungültig.
3. Welcher Wert für deutsche VNBs **immer** verwendet werden soll.

## Erwartung

- Klare Dokumentation, dass `region=Germany` für alle deutschen Markt-Snapshot-Anfragen
  **fest zu verwenden** ist.
- Hinweis auf die ENTSO-E-Beschränkung (keine Sub-Nationalregionen).
- Beispiel-Request mit `region=Germany`.

## Vorschlag

```bash
# Korrekter Call für deutsche VNBs
curl "http://10.0.0.8:3900/api/market-snapshot?region=Germany"
```

---

## Resolution (vom Backend ausgefüllt)

**Bearbeitet:** 2026-04-01
**Lösung:**
- `region` hat keinen serverseitigen Default; ohne Parameter → `renewableForecast24h: null`.
- ENTSO-E unterstützt nur länderbezogene Bidding-Zonen; `"Bayern"` etc. sind ungültig.
- Für alle deutschen VNBs ist **`region=Germany`** der einzig sinnvolle Wert.
- UI-Contract `02-market-snapshot.md` wurde vom Backend entsprechend korrigiert.

**Frontend-Aktion (v0.20.2):**
- `vnb-store.ts`: Irreführenden Kommentar korrigiert — `region`-Feld wird **nicht** als
  market-snapshot-Parameter verwendet.
- `src/config/api-endpoints.ts`: Konstante `MARKET_SNAPSHOT_REGION = 'Germany'` hinzugefügt;
  alle künftigen market-snapshot-Calls müssen diese Konstante verwenden.

**Backend-Version:** 0.20.x
**UI-Contract-Update:** `02-market-snapshot.md` (durch Backend aktualisiert)
