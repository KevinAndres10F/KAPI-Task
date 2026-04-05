export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'todo' | 'in-progress' | 'done';
export type ViewType = 'dashboard' | 'board' | 'backlog' | 'calendar' | 'table';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  order: number;
  assignee?: string;
  dueDate?: string;
  subtasks?: SubTask[];
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Column {
  id: Status;
  title: string;
  tasks: Task[];
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'border-l-blue-400',
  medium: 'border-l-amber-400',
  high: 'border-l-orange-500',
  critical: 'border-l-red-500',
};

export const PRIORITY_BADGE_CLASSES: Record<Priority, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export const PRIORITY_DOT_CLASSES: Record<Priority, string> = {
  low: 'bg-blue-400',
  medium: 'bg-amber-400',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
};

export const STATUS_LABELS: Record<Status, string> = {
  'todo': 'Por Hacer',
  'in-progress': 'En Progreso',
  'done': 'Completado',
};

export const STATUS_BADGE_CLASSES: Record<Status, string> = {
  'todo': 'bg-slate-100 text-slate-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  'done': 'bg-green-100 text-green-700',
};

export const STATUS_DOT_CLASSES: Record<Status, string> = {
  'todo': 'bg-slate-400',
  'in-progress': 'bg-blue-500',
  'done': 'bg-green-500',
};
