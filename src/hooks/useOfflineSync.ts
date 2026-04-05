import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  cacheTasksLocally,
  loadTasksFromCache,
  getPendingChanges,
  clearPendingChanges,
} from '../lib/db';
import { tasksApi } from '../lib/supabaseClient';
import { useTasks } from './useTasks';

const hasSupabase = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Manages offline detection and sync.
 * - Caches tasks to IndexedDB whenever the store updates.
 * - On coming back online, flushes pending changes with LWW resolution.
 * - On app start while offline, loads from IndexedDB cache.
 *
 * Mount once at App root.
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const tasks = useTasks((s) => s.tasks);
  const syncingRef = useRef(false);

  /* ── Track online/offline events ── */
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      void flushPendingChanges();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast('Sin conexión — modo offline activado', {
        icon: '📡',
        style: { background: '#1e293b', color: '#f1f5f9' },
        duration: 4000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /* ── Load from cache on startup if offline ── */
  useEffect(() => {
    if (!isOnline && tasks.length === 0) {
      void loadTasksFromCache().then((cached) => {
        if (cached.length > 0) {
          useTasks.setState({ tasks: cached });
          toast('Datos cargados desde caché local', {
            icon: '💾',
            style: { background: '#1e293b', color: '#f1f5f9' },
            duration: 3000,
          });
        }
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Cache tasks to IndexedDB whenever store changes ── */
  useEffect(() => {
    if (tasks.length > 0) {
      void cacheTasksLocally(tasks);
    }
  }, [tasks]);

  /* ── Flush pending changes on reconnect ── */
  async function flushPendingChanges() {
    if (!hasSupabase || syncingRef.current) return;
    syncingRef.current = true;

    try {
      const pending = await getPendingChanges();
      if (pending.length === 0) {
        toast.success('Conexión restablecida', { icon: '🌐' });
        syncingRef.current = false;
        return;
      }

      const toastId = toast.loading(`Sincronizando ${pending.length} cambio(s)...`);
      const synced: number[] = [];

      for (const change of pending) {
        try {
          if (change.type === 'create' && change.payload.id) {
            await tasksApi.createTask(change.payload as Parameters<typeof tasksApi.createTask>[0]);
          } else if (change.type === 'update' && change.payload.id) {
            const { id, ...updates } = change.payload;
            await tasksApi.updateTask(id!, updates);
          } else if (change.type === 'delete' && change.payload.id) {
            await tasksApi.deleteTask(change.payload.id);
          }
          if (change.id !== undefined) synced.push(change.id);
        } catch {
          // Skip individual failures — will retry on next reconnect
        }
      }

      await clearPendingChanges(synced);
      toast.success(`${synced.length} cambio(s) sincronizados`, { id: toastId, icon: '✅' });
    } catch {
      toast.error('Error al sincronizar cambios pendientes');
    } finally {
      syncingRef.current = false;
    }
  }

  return { isOnline };
}
