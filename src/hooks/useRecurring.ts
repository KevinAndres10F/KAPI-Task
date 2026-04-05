import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, addWeeks, addMonths, format } from 'date-fns';
import type { Task } from '../types';

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly';

export interface RecurringRule {
  id: string;
  taskTemplate: Omit<Task, 'id' | 'order'>;
  frequency: RecurringFrequency;
  nextDue: string;    // ISO date
  lastGenerated: string | null;
}

interface RecurringStore {
  rules: RecurringRule[];
  addRule: (template: Omit<Task, 'id' | 'order'>, frequency: RecurringFrequency) => void;
  deleteRule: (id: string) => void;
  getNextDue: (rule: RecurringRule) => string;
  /** Returns tasks to generate (whose nextDue <= today). Caller must add them. */
  getDueRules: () => RecurringRule[];
  markGenerated: (id: string) => void;
}

function computeNext(from: string, frequency: RecurringFrequency): string {
  const d = new Date(from);
  if (frequency === 'daily')   return format(addDays(d, 1), 'yyyy-MM-dd');
  if (frequency === 'weekly')  return format(addWeeks(d, 1), 'yyyy-MM-dd');
  return format(addMonths(d, 1), 'yyyy-MM-dd');
}

export const useRecurring = create<RecurringStore>()(
  persist(
    (set, get) => ({
      rules: [],

      addRule: (template, frequency) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        set((s) => ({
          rules: [
            ...s.rules,
            {
              id: crypto.randomUUID(),
              taskTemplate: template,
              frequency,
              nextDue: today,
              lastGenerated: null,
            },
          ],
        }));
      },

      deleteRule: (id) =>
        set((s) => ({ rules: s.rules.filter((r) => r.id !== id) })),

      getNextDue: (rule) => computeNext(rule.nextDue, rule.frequency),

      getDueRules: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        return get().rules.filter((r) => r.nextDue <= today);
      },

      markGenerated: (id) =>
        set((s) => ({
          rules: s.rules.map((r) =>
            r.id === id
              ? { ...r, lastGenerated: new Date().toISOString(), nextDue: computeNext(r.nextDue, r.frequency) }
              : r
          ),
        })),
    }),
    { name: 'kapi-recurring' }
  )
);
