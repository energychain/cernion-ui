'use client';

import { useQuery } from '@tanstack/react-query';
import { useVnbStore } from '@/stores/vnb-store';
import { useApiClient } from '@/hooks/use-api-client';
import { API } from '@/config/api-endpoints';
import type { MarketPartner } from '@/types/ui';

interface RawMarketPartner {
  companyName?: string;
  bdewCode?: string;
  mastrNetzbetreiberId?: string | null;
  contacts?: Array<{ city?: string }>;
  codeType?: string;
  source?: string;
}

interface MarketPartnersResponse {
  data?: {
    query?: string;
    count?: number;
    results?: RawMarketPartner[];
  };
}

export interface VnbCanonical {
  bdewCodePrimary?: string | null;
  mastrId?: string | null;
  name?: string | null;
}

export interface VnbLookupCodesResponse {
  canonical?: VnbCanonical | null;
  conflictFlags?: string[];
  candidates?: Array<{
    bdewCode?: string | null;
    mastrId?: string | null;
    name?: string | null;
    source?: string | null;
  }>;
}

/** Outer envelope wrapping every Cernion API response */
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  metadata?: unknown;
}

export interface ResolvedVnbIdentity {
  resolved: boolean;
  bdewCode: string;
  mastrId: string | null;
  name: string | null;
  conflictFlags: string[];
  candidates: NonNullable<VnbLookupCodesResponse['candidates']>;
}

export function useVnbContext() {
  return useVnbStore();
}

/**
 * Resolve a BDEW code via vnb-lookup-codes to get the canonical MaStR-ID.
 * The query is disabled when bdewCode is null/empty.
 */
export function useResolveVnbIdentity(bdewCode: string | null) {
  const { post } = useApiClient();

  return useQuery({
    queryKey: ['vnb-lookup-codes', bdewCode],
    queryFn: async (): Promise<ResolvedVnbIdentity> => {
      const envelope = await post<ApiEnvelope<VnbLookupCodesResponse>>(
        API.VNB_LOOKUP_CODES,
        { bdewCode, includeAliases: true },
      );
      // The backend wraps every response in { success, data, metadata }.
      // Unwrap the inner payload before reading canonical/conflictFlags.
      const data = envelope.data ?? {};

      if (!data.canonical?.mastrId) {
        return {
          resolved: false,
          bdewCode: bdewCode!,
          mastrId: null,
          name: data.canonical?.name ?? null,
          conflictFlags: data.conflictFlags ?? [],
          candidates: data.candidates ?? [],
        };
      }

      return {
        resolved: true,
        bdewCode: data.canonical.bdewCodePrimary ?? bdewCode!,
        mastrId: data.canonical.mastrId,
        name: data.canonical.name ?? null,
        conflictFlags: data.conflictFlags ?? [],
        candidates: data.candidates ?? [],
      };
    },
    enabled: !!bdewCode,
    staleTime: 5 * 60_000, // 5 min — BDEW→MaStR mapping rarely changes
    retry: false,         // a 500 won't be retried; data stays undefined
    throwOnError: false,  // never propagate to the nearest error boundary
  });
}

/**
 * Search market partners (VNBs) via the REST API.
 * Minimum 2 chars to trigger the search.
 */
export function useMarketPartnerSearch(query: string) {
  const { get } = useApiClient();

  return useQuery({
    queryKey: ['market-partners', query],
    queryFn: () =>
      get<MarketPartnersResponse>(API.MARKET_PARTNERS, {
        params: { query, limit: 10 },
      }),
    enabled: query.trim().length >= 2,
    staleTime: 60_000,
    select: (data): MarketPartner[] => {
      const raw = data?.data?.results ?? [];
      const mapped = raw
        .map((p) => ({
          bdewCode: p.bdewCode ?? '',
          mastrId: p.mastrNetzbetreiberId ?? '',
          name: p.companyName ?? '',
          city: p.contacts?.[0]?.city,
          type: p.source,
        }))
        .filter((p) => p.bdewCode.trim().length > 0);

      const unique = new Map<string, MarketPartner>();
      for (const partner of mapped) {
        const key = `${partner.bdewCode}|${partner.name}|${partner.mastrId ?? ''}`;
        if (!unique.has(key)) {
          unique.set(key, partner);
        }
      }

      return Array.from(unique.values());
    },
  });
}
