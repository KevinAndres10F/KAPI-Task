import Papa from 'papaparse';
import type { Task, Priority, Status } from '../types';

const PRIORITY_VALUES: Priority[] = ['low', 'medium', 'high', 'critical'];
const STATUS_VALUES: Status[] = ['todo', 'in-progress', 'done'];

/** Export tasks array to a downloadable CSV file. */
export function exportTasksToCSV(tasks: Task[], filename = 'kapi-tasks.csv') {
  const rows = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description ?? '',
    status: t.status,
    priority: t.priority,
    assignee: t.assignee ?? '',
    dueDate: t.dueDate ?? '',
    order: t.order,
    subtasks: (t.subtasks ?? []).map((s) => `${s.title}:${s.completed ? '1' : '0'}`).join('|'),
  }));

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Parse a CSV file and return an array of Tasks (partial — no IDs). */
export function parseTasksFromCSV(file: File): Promise<Omit<Task, 'id'>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length) {
          reject(new Error(errors[0].message));
          return;
        }

        const tasks: Omit<Task, 'id'>[] = data.map((row, i) => ({
          title: row.title?.trim() || `Tarea importada ${i + 1}`,
          description: row.description?.trim() ?? '',
          status: STATUS_VALUES.includes(row.status as Status) ? (row.status as Status) : 'todo',
          priority: PRIORITY_VALUES.includes(row.priority as Priority) ? (row.priority as Priority) : 'medium',
          assignee: row.assignee?.trim() || undefined,
          dueDate: row.dueDate?.trim() || undefined,
          order: Number(row.order) || i,
          subtasks: row.subtasks
            ? row.subtasks.split('|').filter(Boolean).map((s) => {
                const [title, done] = s.split(':');
                return { id: crypto.randomUUID(), title: title ?? s, completed: done === '1' };
              })
            : [],
        }));

        resolve(tasks);
      },
      error: (err) => reject(err),
    });
  });
}
