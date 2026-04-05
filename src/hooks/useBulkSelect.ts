import { create } from 'zustand';

interface BulkSelectStore {
  selected: Set<string>;
  toggle: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearAll: () => void;
  isSelected: (id: string) => boolean;
}

export const useBulkSelect = create<BulkSelectStore>((set, get) => ({
  selected: new Set(),

  toggle: (id) => set((s) => {
    const next = new Set(s.selected);
    next.has(id) ? next.delete(id) : next.add(id);
    return { selected: next };
  }),

  selectAll: (ids) => set({ selected: new Set(ids) }),
  clearAll: () => set({ selected: new Set() }),
  isSelected: (id) => get().selected.has(id),
}));
