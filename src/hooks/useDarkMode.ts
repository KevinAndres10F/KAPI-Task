import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DarkModeStore {
  dark: boolean;
  toggle: () => void;
}

export const useDarkMode = create<DarkModeStore>()(
  persist(
    (set, get) => ({
      dark: window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggle: () => {
        const next = !get().dark;
        document.documentElement.classList.toggle('dark', next);
        set({ dark: next });
      },
    }),
    {
      name: 'kapi-dark-mode',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle('dark', state.dark);
        }
      },
    }
  )
);

// Apply on first load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('kapi-dark-mode');
  const dark = stored ? JSON.parse(stored)?.state?.dark : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', dark);
}
