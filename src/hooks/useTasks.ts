import { create } from 'zustand';
import type { Task } from '../types';

interface TasksStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;

  // Actions
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: Task['status'], newOrder: number) => void;
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTasks = create<TasksStore>((set) => ({
  tasks: [],
  loading: false,
  error: null,

  addTask: (task: Task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
      error: null,
    })),

  updateTask: (id: string, updates: Partial<Task>) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
      error: null,
    })),

  deleteTask: (id: string) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
      error: null,
    })),

  moveTask: (taskId: string, newStatus: Task['status'], newOrder: number) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus, order: newOrder }
          : task
      ),
      error: null,
    })),

  setTasks: (tasks: Task[]) =>
    set({
      tasks,
      error: null,
    }),

  setLoading: (loading: boolean) =>
    set({ loading }),

  setError: (error: string | null) =>
    set({ error }),
}));
