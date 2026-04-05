import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TimeEntry {
  id: string;
  taskId: string;
  startedAt: string;
  stoppedAt: string | null;   // null = currently running
  durationMs: number;         // 0 while running, filled on stop
}

interface TimeTrackingStore {
  entries: TimeEntry[];
  activeTaskId: string | null;

  start: (taskId: string) => void;
  stop: () => void;
  toggle: (taskId: string) => void;
  getTotal: (taskId: string) => number;     // total ms for task
  isRunning: (taskId: string) => boolean;
  getActiveEntry: () => TimeEntry | null;
}

export const useTimeTracking = create<TimeTrackingStore>()(
  persist(
    (set, get) => ({
      entries: [],
      activeTaskId: null,

      start: (taskId) => {
        const state = get();
        // Stop any running entry first
        if (state.activeTaskId) get().stop();

        const entry: TimeEntry = {
          id: crypto.randomUUID(),
          taskId,
          startedAt: new Date().toISOString(),
          stoppedAt: null,
          durationMs: 0,
        };
        set((s) => ({ entries: [...s.entries, entry], activeTaskId: taskId }));
      },

      stop: () => {
        const state = get();
        if (!state.activeTaskId) return;
        const now = new Date().toISOString();
        set((s) => ({
          entries: s.entries.map((e) =>
            e.stoppedAt === null && e.taskId === s.activeTaskId
              ? { ...e, stoppedAt: now, durationMs: Date.now() - new Date(e.startedAt).getTime() }
              : e
          ),
          activeTaskId: null,
        }));
      },

      toggle: (taskId) => {
        const state = get();
        if (state.activeTaskId === taskId) {
          get().stop();
        } else {
          get().start(taskId);
        }
      },

      getTotal: (taskId) => {
        const state = get();
        return state.entries
          .filter((e) => e.taskId === taskId)
          .reduce((sum, e) => {
            if (e.stoppedAt) return sum + e.durationMs;
            // Currently running
            return sum + (Date.now() - new Date(e.startedAt).getTime());
          }, 0);
      },

      isRunning: (taskId) => get().activeTaskId === taskId,

      getActiveEntry: () => {
        const state = get();
        return state.entries.find((e) => e.stoppedAt === null) ?? null;
      },
    }),
    { name: 'kapi-time-tracking' }
  )
);

/** Format ms → "1h 23m" or "45m" */
export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
