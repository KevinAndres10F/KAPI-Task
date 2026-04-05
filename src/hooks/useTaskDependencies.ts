import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Dependency {
  id: string;
  fromTaskId: string;   // this task BLOCKS the other
  toTaskId: string;     // this task is BLOCKED BY fromTask
}

interface DependenciesStore {
  dependencies: Dependency[];
  addDependency: (fromTaskId: string, toTaskId: string) => void;
  removeDependency: (id: string) => void;
  getBlockedBy: (taskId: string) => string[];   // task IDs that block this task
  getBlocking: (taskId: string) => string[];    // task IDs this task blocks
  isBlocked: (taskId: string, doneTasks: Set<string>) => boolean;
}

export const useTaskDependencies = create<DependenciesStore>()(
  persist(
    (set, get) => ({
      dependencies: [],

      addDependency: (fromTaskId, toTaskId) => {
        if (fromTaskId === toTaskId) return;
        // Prevent duplicate
        const exists = get().dependencies.some(
          (d) => d.fromTaskId === fromTaskId && d.toTaskId === toTaskId
        );
        if (exists) return;
        set((s) => ({
          dependencies: [
            ...s.dependencies,
            { id: crypto.randomUUID(), fromTaskId, toTaskId },
          ],
        }));
      },

      removeDependency: (id) =>
        set((s) => ({ dependencies: s.dependencies.filter((d) => d.id !== id) })),

      getBlockedBy: (taskId) =>
        get().dependencies
          .filter((d) => d.toTaskId === taskId)
          .map((d) => d.fromTaskId),

      getBlocking: (taskId) =>
        get().dependencies
          .filter((d) => d.fromTaskId === taskId)
          .map((d) => d.toTaskId),

      isBlocked: (taskId, doneTasks) => {
        const blockedBy = get().getBlockedBy(taskId);
        return blockedBy.some((id) => !doneTasks.has(id));
      },
    }),
    { name: 'kapi-dependencies' }
  )
);
