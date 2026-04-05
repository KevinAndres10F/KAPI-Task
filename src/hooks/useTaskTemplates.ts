import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task } from '../types';

export interface TaskTemplate {
  id: string;
  name: string;
  task: Omit<Task, 'id' | 'order'>;
  createdAt: string;
}

interface TemplatesStore {
  templates: TaskTemplate[];
  saveTemplate: (name: string, task: Omit<Task, 'id' | 'order'>) => void;
  deleteTemplate: (id: string) => void;
  applyTemplate: (id: string) => Omit<Task, 'id' | 'order'> | null;
}

export const useTaskTemplates = create<TemplatesStore>()(
  persist(
    (set, get) => ({
      templates: [],

      saveTemplate: (name, task) => {
        const template: TaskTemplate = {
          id: crypto.randomUUID(),
          name,
          task,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ templates: [...s.templates, template] }));
      },

      deleteTemplate: (id) =>
        set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),

      applyTemplate: (id) => {
        const tpl = get().templates.find((t) => t.id === id);
        return tpl ? { ...tpl.task } : null;
      },
    }),
    { name: 'kapi-templates' }
  )
);
