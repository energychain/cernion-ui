// ── Asset domain types ────────────────────────────────────────────────────────

export type AssetType =
  | 'solar'
  | 'wind'
  | 'storage'
  | 'biomass'
  | 'combustion'
  | 'hydro'
  | 'other';

/**
 * Raw asset shape as delivered by the backend (/api/assets/list, /api/assets/all).
 * Field names are the German MaStR identifiers exactly as returned by the API.
 */
export interface RawAsset {
  'SEE Nummer': string;
  'Einheit Systemstatus'?: string | null;
  Anlagentyp?: string | null;
  /** Operator name */
  Betreiber?: string | null;
  'Marktaktuer MaStR'?: string | null;
  'Marktakteuer Name'?: string | null;
  'Marktakteur Adresse'?: string | null;
  'Netzbetreiber MaStR'?: string | null;
  'Netzbetreiber Name'?: string | null;
  /** Gross capacity in MW */
  'Leistung MW'?: number | null;
  /** Gross capacity in kW */
  'Leistung kW'?: number | null;
  /** Inverter capacity kW (PV / storage) */
  Wechselrichterleistung?: number | null;
  Technologie?: string | null;
  /** Usable storage capacity kWh */
  'Speicherkapazität'?: number | null;
  'C-Rate'?: number | null;
  'AC Nennleistung'?: number | null;
  'DC Nennleistung'?: number | null;
  Batterietechnologie?: string | null;
  Batteriemodulhersteller?: string | null;
  Hauptausrichtung?: string | null;
  Neigungswinkel?: number | null;
  Leistungsbegrenzung?: string | null;
  'Nabenhöhe'?: number | null;
  Rotordurchmesser?: number | null;
  Hersteller?: string | null;
  Typenbezeichnung?: string | null;
  /** e.g. '31'=Planung, '35'=In Betrieb, '37'=Temp. stillgelegt, '38'=Dauerhaft stillgelegt */
  Betriebsstatus?: string | null;
  'Betriebsstatus Name'?: string | null;
  /** ISO 8601 commissioning date */
  'Datum Netzzugang'?: string | null;
  Registrierungsdatum?: string | null;
  Genehmigungsdatum?: string | null;
  'AC-DC-Kopplung'?: string | null;
  Einspeisungsart?: string | null;
  Spannungsebene?: string | null;
  Fernsteuerbarkeit?: string | null;
  Einsatzverantwortlicher?: string | null;
  Postleitzahl?: string | null;
  Ort?: string | null;
  Gemeinde?: string | null;
  Landkreis?: string | null;
  Bundesland?: string | null;
  'Längengrad'?: number | null;
  Breitengrad?: number | null;
  'Fläche'?: number | null;
  'Anzahl Module'?: number | null;
  'Leistung je Modul'?: number | null;
  /**
   * NBP-Prüfstatus code:
   *  2954 = Geprüft ✅
   *  2955 = In Prüfung ⏳
   *  3075 = Nicht vorgesehen
   */
  'Netzbetreiberpruefung Status'?: number | null;
  'Netzbetreiberpruefung Status Name'?: string | null;
  /** Network Access Point MaStR ID (SAN…) */
  'NAP MaStR Nummer'?: string | null;
  /** MeLo-ID (DE…, 33 chars) */
  'Messlokation (MeLo)'?: string | null;
  /** Voltage level at NAP: Niederspannung / Mittelspannung / … */
  'Spannungsebene NAP'?: string | null;
  'Nettoengpassleistung kW'?: number | null;
  'Netz MaStR Nummer'?: string | null;
  'Netzbetreiber NAP MaStR'?: string | null;
}

export interface AssetQueryParams {
  limit?: number;
  status?: string;
  redispatchOnly?: boolean;
  types?: AssetType[];
}

export interface AssetsResponse {
  success: boolean;
  data: RawAsset[];
  count?: number;
  _errors?: string[];
}
