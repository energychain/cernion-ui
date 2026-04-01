import { create } from 'zustand';
import type { ApiLogEntry } from '@/types/ui';
import { API_LOG_MAX_ENTRIES } from '@/lib/constants';
import { uid } from '@/lib/utils';

interface ApiLogState {
  entries: ApiLogEntry[];
  isOpen: boolean;
  addEntry: (entry: Omit<ApiLogEntry, 'id'>) => void;
  clearEntries: () => void;
  setOpen: (open: boolean) => void;
}

export const useApiLogStore = create<ApiLogState>()((set) => ({
  entries: [],
  isOpen: false,
  addEntry: (entry) =>
    set((state) => ({
      entries: [
        { ...entry, id: uid() },
        ...state.entries,
      ].slice(0, API_LOG_MAX_ENTRIES),
    })),
  clearEntries: () => set({ entries: [] }),
  setOpen: (isOpen) => set({ isOpen }),
}));
