import { create } from 'zustand';
import type { AITask } from '../lib/geminiClient';

interface AIStore {
  loading: boolean;
  error: string | null;
  lastResult: AITask | null;

  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
  setResult: (v: AITask | null) => void;
  reset: () => void;
}

export const useAI = create<AIStore>((set) => ({
  loading: false,
  error: null,
  lastResult: null,

  setLoading: (v) => set({ loading: v, error: null }),
  setError: (v) => set({ error: v, loading: false }),
  setResult: (v) => set({ lastResult: v, loading: false, error: null }),
  reset: () => set({ loading: false, error: null, lastResult: null }),
}));
