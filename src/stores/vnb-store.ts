import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VnbState {
  bdewCode: string | null;
  mastrId: string | null;
  name: string | null;
  /** City derived from market-partners response (display only). Not passed to
   * market-snapshot — ENTSO-E only supports country-level bidding zones.
   * Always use MARKET_SNAPSHOT_REGION ('Germany') for forecast calls. */
  region: string | null;
  setVnb: (bdewCode: string, mastrId: string, name: string, region?: string) => void;
  clearVnb: () => void;
}

export const useVnbStore = create<VnbState>()(
  persist(
    (set) => ({
      bdewCode: null,
      mastrId: null,
      name: null,
      region: null,
      setVnb: (bdewCode, mastrId, name, region) =>
        set({ bdewCode, mastrId, name, region: region ?? null }),
      clearVnb: () => set({ bdewCode: null, mastrId: null, name: null, region: null }),
    }),
    { name: 'cernion-vnb' }
  )
);
