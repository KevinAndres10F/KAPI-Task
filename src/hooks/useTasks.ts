import { create } from 'zustand';
import type { Task } from '../types';
import { tasksApi } from '../lib/supabaseClient';

const hasSupabase = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

type NewTaskInput = Omit<Task, 'id' | 'order'> & {
  order?: number;
  status?: Task['status'];
};

interface TasksStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;

  // Actions
  loadTasks: () => Promise<void>;
  addTask: (task: NewTaskInput) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: Task['status'], newOrder: number) => Promise<void>;
  persistTasksOrder: (tasks: Task[]) => Promise<void>;
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTasks = create<TasksStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  loadTasks: async () => {
    set({ loading: true, error: null });

    try {
      if (!hasSupabase) {
        set({ tasks: [], loading: false });
        return;
      }

      const data = await tasksApi.getTasks();
      set({ tasks: data, loading: false, error: null });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load tasks',
      });
    }
  },

  addTask: async (task: NewTaskInput) => {
    const currentTasks = get().tasks;
    const status = task.status || 'todo';
    const nextOrder =
      task.order ??
      currentTasks.filter((item) => item.status === status).length;

    const fallbackTask: Task = {
      id: crypto.randomUUID(),
      title: task.title,
      description: task.description || '',
      status,
      priority: task.priority,
      order: nextOrder,
      assignee: task.assignee,
      dueDate: task.dueDate,
      subtasks: task.subtasks || [],
    };

    set((state) => ({
      tasks: [...state.tasks, fallbackTask],
      error: null,
    }));

    if (!hasSupabase) return;

    try {
      const created = await tasksApi.createTask({
        ...fallbackTask,
      });

      if (created) {
        set((state) => ({
          tasks: state.tasks.map((item) =>
            item.id === fallbackTask.id ? created : item
          ),
          error: null,
        }));
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create task',
      });
    }
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
      error: null,
    }));

    if (!hasSupabase) return;

    try {
      await tasksApi.updateTask(id, updates);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update task',
      });
    }
  },

  deleteTask: async (id: string) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
      error: null,
    }));

    if (!hasSupabase) return;

    try {
      await tasksApi.deleteTask(id);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete task',
      });
    }
  },

  moveTask: async (taskId: string, newStatus: Task['status'], newOrder: number) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus, order: newOrder }
          : task
      ),
      error: null,
    }));

    if (!hasSupabase) return;

    try {
      await tasksApi.updateTask(taskId, { status: newStatus, order: newOrder });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to move task',
      });
    }
  },

  persistTasksOrder: async (tasks: Task[]) => {
    if (!hasSupabase) return;

    try {
      await tasksApi.updateTaskOrder(tasks);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update task order',
      });
    }
  },

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
