export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Column {
  id: 'todo' | 'in-progress' | 'done';
  title: string;
  tasks: Task[];
}
