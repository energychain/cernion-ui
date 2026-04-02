# GitHub Copilot Instructions — Cernion Enterprise UI

## Feedback an das Backend

Wenn du auf ein API-Problem triffst (Validierungsfehler, unerwartete Response,
fehlende Felder, undokumentiertes Verhalten), erstelle eine Feedback-Datei in
`feedback/` gemäß dem Template in `feedback/TEMPLATE.md`.

Typen:
- `BR-` (Bug Report): API verhält sich anders als in `docs/ui-contracts/` dokumentiert
- `CR-` (Change Request): Neuer Endpoint, Parameter oder Response-Feld benötigt
- `IR-` (Information Request): Fachliche Klärung (Warum ist Feld X null?)
- `DR-` (Documentation Request): UI-Contract ist unvollständig oder widersprüchlich

Nummerierung: Fortlaufend (BR-0001, BR-0002, ...). Prüfe bestehende Dateien vor dem
Anlegen einer neuen.
