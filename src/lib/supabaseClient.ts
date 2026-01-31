import { createClient } from '@supabase/supabase-js';
import type { Task } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const mapDbTask = (task: any): Task => {
  if (!task) return task as Task;
  const { due_date, ...rest } = task;
  return {
    ...(rest as Task),
    dueDate: due_date ?? task.dueDate,
    subtasks: task.subtasks ?? [],
  };
};

const mapTaskToDb = (task: Partial<Task>) => {
  if (!task) return task;
  const { dueDate, ...rest } = task;
  return {
    ...rest,
    due_date: dueDate,
    subtasks: task.subtasks ?? [],
  };
};

export const tasksApi = {
  async getTasks() {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userData?.user) return [];

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('order', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapDbTask);
  },

  async createTask(task: Task) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userData?.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          ...mapTaskToDb(task),
          id: crypto.randomUUID(),
          user_id: userData.user.id,
        },
      ])
      .select();

    if (error) throw error;
    return mapDbTask(data?.[0]);
  },

  async updateTask(id: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(mapTaskToDb(updates))
      .eq('id', id)
      .select();

    if (error) throw error;
    return mapDbTask(data?.[0]);
  },

  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateTaskOrder(tasks: Task[]) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userData?.user) throw new Error('Not authenticated');

    const payload = tasks.map((task) => ({
      id: task.id,
      status: task.status,
      order: task.order,
      user_id: task.user_id || userData.user.id,
    }));

    const { error } = await supabase
      .from('tasks')
      .upsert(payload);

    if (error) throw error;
  },
};

export const authApi = {
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.session;
  },

  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data.session;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  onAuthStateChange(callback: (session: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  },
};
