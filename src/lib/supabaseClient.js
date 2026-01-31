import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper functions for Supabase operations
export const tasksApi = {
  // Get all tasks
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Create a new task
  async createTask(task: { title: string; description: string; status: string; order: number }) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...task, id: crypto.randomUUID() }])
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  // Update a task
  async updateTask(id: string, updates: Partial<any>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  // Delete a task
  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Update task order
  async updateTaskOrder(tasks: any[]) {
    const { error } = await supabase
      .from('tasks')
      .upsert(tasks);
    
    if (error) throw error;
  }
};
