# CR-0001: Strukturierte Validierungs-Fehlermeldungen in Dashboard-API

**Typ:** Change Request
**Erstellt:** 2026-03-28
**Status:** resolved
**Priorität:** medium
**Betrifft:** `00-architecture.md`
**Backend-Version:** 0.20.0
**Frontend-Version:** 0.20.1

---

## Kontext

Bei ungültigen API-Parametern (z.B. falsch formatierter BDEW-Code) liefert das
Backend generische Fehlermeldungen ohne Hinweis auf das betroffene Feld oder den
erwarteten Wert. Das erschwert das Debugging und verhindert Inline-Feedback in der UI.

## Problem / Frage / Anforderung

Moleculer's Fastest-Validator sendet bei Parameterfehlern nur:

```json
{
  "code": 422,
  "message": "Parameters validation error!",
  "data": []
}
```

Das Frontend kann daraus nicht ableiten, welches Feld betroffen ist oder was der
erwartete Wert sein sollte.

## Erwartung

Strukturierte Validation-Errors mit:
- `field`: betroffenes Feld
- `message`: menschenlesbare deutsche Fehlermeldung
- `actual`/`received`: tatsächlich gesendeter Wert
- `example`: Beispielwert für korrektes Format

## Vorschlag

```json
{
  "code": 422,
  "type": "VALIDATION_ERROR",
  "data": [{
    "field": "bdewCode",
    "message": "bdewCode muss 13 Ziffern enthalten (Beispiel: 9907473000008)",
    "actual": "INVALID"
  }]
}
```

---

## Resolution (vom Backend ausgefüllt)

**Bearbeitet:** 2026-04-02
**Backend-Version:** 0.20.1
**UI-Contract-Update:** Ja — `00-architecture.md`, Abschnitt „Validation errors (422)"

Alle drei betroffenen Actions (`vnbOverview`, `marketSnapshot`, `qualitySummary`)
wurden mit Fastest-Validator `params`-Definitionen und deutschen Custom-Messages
ausgestattet.

**Tatsächliches Response-Format (leichte Abweichung vom Vorschlag):**
```json
{
  "code": 422,
  "type": "VALIDATION_ERROR",
  "message": "Parameters validation error!",
  "data": [{
    "type": "stringPattern",
    "message": "bdewCode muss 7-13 Ziffern enthalten (Beispiel: 9907473000008)",
    "field": "bdewCode",
    "actual": "INVALID"
  }]
}
```

`example` ist in `message` eingebettet (Klammerzusatz). `received` entspricht `actual`.
`bdewCode`-Pattern: `/^\d{7,13}$/` (7–13 Stellen statt exakt 13 — BDEW-Codes
haben in der Praxis unterschiedliche Längen).

**Frontend-Folgeaktion (v0.20.2):**
- `src/types/ui.ts`: `ValidationFieldError`-Interface hinzugefügt (`type`, `message`,
  `field`, `actual`)
- `src/lib/utils.ts`: `getApiErrorMessage()` hinzugefügt — extrahiert bei 422 das
  erste `data[].message`, bei 503/404 die `message` aus dem Response-Body,
  sonst den Fallback-Text
- `src/features/dashboard/dashboard-overview.tsx`: `isError`-Zustand verwendet
  `getApiErrorMessage(error, ...)` statt hardcoded Text
