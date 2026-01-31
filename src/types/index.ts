export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'todo' | 'in-progress' | 'done';

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
  created_at?: string;
  updated_at?: string;
}

export interface Column {
  id: Status;
  title: string;
  tasks: Task[];
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'border-l-blue-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-orange-500',
  critical: 'border-l-red-500',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};
