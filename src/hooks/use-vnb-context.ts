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

export function useVnbContext() {
  return useVnbStore();
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
