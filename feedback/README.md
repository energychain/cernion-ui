# Frontend → Backend Feedback

Dieses Verzeichnis enthält strukturierte Rückmeldungen an das Backend-Repository
(`cernion-energy-tools`). Jede Datei beschreibt ein Problem, eine Anfrage oder
einen Änderungswunsch, der vom Backend bearbeitet werden muss.

## Typen

| Prefix | Typ | Beschreibung |
|--------|-----|-------------|
| `BR-`  | Bug Report | API verhält sich anders als im UI-Contract dokumentiert |
| `CR-`  | Change Request | Neuer Endpoint, Parameter oder Response-Feld benötigt |
| `IR-`  | Information Request | Fachliche Klärung (Warum ist Feld X null?) |
| `DR-`  | Documentation Request | UI-Contract ist unvollständig oder inkorrekt |

## Workflow

1. Feedback-Datei erstellen (nutze `TEMPLATE.md`)
2. Committen + Pushen
3. Bei `critical`/`high`: Backend-Team direkt informieren
4. Backend setzt Status auf `acknowledged` → `in-progress` → `resolved`
5. Nach Resolution: Frontend prüft Fix, setzt Status auf `verified` oder `reopened`

## Verzeichnisse

| Verzeichnis | Inhalt |
|---|---|
| `feedback/` (root) | Outbound-Feedbacks (offen und geschlossen) |
| `feedback/inbound/` | Antworten des Backends (`RES-<typ>-<nr>.md`) |

Eingehende Resolutions vom Backend werden in `inbound/` abgelegt und folgen dem
Namensschema `RES-IR-0001.md`, `RES-BR-0002.md` etc. Das Frontend liest die
Resolution, aktualisiert die ursprüngliche Feedback-Datei (Status → `resolved`)
und implementiert ggf. notwendige Änderungen.

## Nummerierung

Fortlaufend pro Typ: BR-0001, BR-0002, CR-0001, etc.
