import { useEffect } from 'react';
import { subscribeToTaskChanges } from '../lib/supabaseClient';
import { useTasks } from './useTasks';

const hasSupabase = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Subscribes to Supabase Realtime postgres_changes on the tasks table.
 * Keeps the local Zustand store in sync with changes made by other users.
 * Must be called once at the App root level.
 */
export function useRealtimeSync() {
  const { tasks, setTasks } = useTasks();

  useEffect(() => {
    if (!hasSupabase) return;

    const channel = subscribeToTaskChanges((task, eventType) => {
      const current = useTasks.getState().tasks;

      if (eventType === 'INSERT') {
        // Only add if not already present (avoid duplicate from optimistic update)
        if (!current.find((t) => t.id === task.id)) {
          useTasks.setState({ tasks: [...current, task] });
        }
      } else if (eventType === 'UPDATE') {
        useTasks.setState({
          tasks: current.map((t) => (t.id === task.id ? { ...t, ...task } : t)),
        });
      } else if (eventType === 'DELETE') {
        useTasks.setState({
          tasks: current.filter((t) => t.id !== task.id),
        });
      }
    });

    return () => {
      void channel.unsubscribe();
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Suppress unused warning — tasks is read via getState() inside callback
  void tasks;
  void setTasks;
}
