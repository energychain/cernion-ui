'use client';

import { useQuery } from '@tanstack/react-query';
import { useVnbStore } from '@/stores/vnb-store';
import { useApiClient } from '@/hooks/use-api-client';
import { API } from '@/config/api-endpoints';
import type { AssetQueryParams, AssetsResponse } from './assets.types';

interface UseAssetsOptions {
  refetchInterval?: number | false;
}

export function useAssets(
  params: AssetQueryParams = {},
  options: UseAssetsOptions = {},
) {
  const { bdewCode, mastrId } = useVnbStore();
  const { get } = useApiClient();

  return useQuery<AssetsResponse>({
    queryKey: ['assets', bdewCode, mastrId, params],
    queryFn: () =>
      get<AssetsResponse>(API.ASSETS_ALL, {
        params: {
          bdewCode: bdewCode ?? undefined,
          gridOperatorId: mastrId ?? undefined,
          includeNapData: true,
          limit: params.limit ?? 1000,
          redispatch: params.redispatchOnly || undefined,
          operationalStatus: params.status ?? '35',
          types: params.types?.join(',') ?? undefined,
        },
      }),
    enabled: !!(bdewCode || mastrId),
    staleTime: 5 * 60 * 1000,
    retry: false,
    throwOnError: false,
    refetchInterval: options.refetchInterval ?? false,
  });
}
