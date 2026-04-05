import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ActivityType =
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'task_moved'
  | 'comment_added'
  | 'status_changed';

export interface ActivityEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  type: ActivityType;
  detail: string;
  actor: string;
  timestamp: string;
}

interface ActivityLogStore {
  entries: ActivityEntry[];
  addEntry: (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;
  clear: () => void;
}

export const useActivityLog = create<ActivityLogStore>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((s) => ({
          entries: [
            { ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() },
            ...s.entries,
          ].slice(0, 200), // keep last 200
        })),
      clear: () => set({ entries: [] }),
    }),
    { name: 'kapi-activity-log' }
  )
);
