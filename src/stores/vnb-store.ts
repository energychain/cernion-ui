import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VnbState {
  bdewCode: string | null;
  mastrId: string | null;
  name: string | null;
  setVnb: (bdewCode: string, mastrId: string, name: string) => void;
  clearVnb: () => void;
}

export const useVnbStore = create<VnbState>()(
  persist(
    (set) => ({
      bdewCode: null,
      mastrId: null,
      name: null,
      setVnb: (bdewCode, mastrId, name) => set({ bdewCode, mastrId, name }),
      clearVnb: () => set({ bdewCode: null, mastrId: null, name: null }),
    }),
    { name: 'cernion-vnb' }
  )
);
