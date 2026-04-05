import Dexie, { type EntityTable } from 'dexie';
import type { Task } from '../types';

/* ── Pending change record ─────────────────────────────── */
export interface PendingChange {
  id?: number;           // auto-increment primary key
  taskId: string;
  type: 'create' | 'update' | 'delete';
  payload: Partial<Task>;
  timestamp: number;     // ms — used for Last-Write-Wins resolution
}

/* ── Dexie DB definition ───────────────────────────────── */
class KapiDB extends Dexie {
  tasks!: EntityTable<Task, 'id'>;
  pendingChanges!: EntityTable<PendingChange, 'id'>;

  constructor() {
    super('kapi-task-db');
    this.version(1).stores({
      tasks: 'id, status, priority, order, dueDate',
      pendingChanges: '++id, taskId, type, timestamp',
    });
  }
}

export const db = new KapiDB();

/* ── Helpers ───────────────────────────────────────────── */

/** Cache the full task list into IndexedDB. */
export async function cacheTasksLocally(tasks: Task[]) {
  await db.transaction('rw', db.tasks, async () => {
    await db.tasks.clear();
    await db.tasks.bulkPut(tasks);
  });
}

/** Load all tasks from IndexedDB (offline fallback). */
export async function loadTasksFromCache(): Promise<Task[]> {
  return db.tasks.orderBy('order').toArray();
}

/** Queue a pending change for sync when back online. */
export async function queuePendingChange(
  change: Omit<PendingChange, 'id'>
) {
  // Collapse multiple updates to same task: keep only latest
  if (change.type === 'update') {
    const existing = await db.pendingChanges
      .where('taskId').equals(change.taskId)
      .and((c) => c.type === 'update')
      .first();
    if (existing?.id !== undefined) {
      await db.pendingChanges.update(existing.id, {
        payload: { ...existing.payload, ...change.payload },
        timestamp: change.timestamp,
      });
      return;
    }
  }
  await db.pendingChanges.add(change);
}

/** Get all pending changes ordered by timestamp. */
export async function getPendingChanges(): Promise<PendingChange[]> {
  return db.pendingChanges.orderBy('timestamp').toArray();
}

/** Remove pending changes after successful sync. */
export async function clearPendingChanges(ids: number[]) {
  await db.pendingChanges.bulkDelete(ids);
}
