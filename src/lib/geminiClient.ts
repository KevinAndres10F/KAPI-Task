import type { Priority, Status } from '../types';

// In production (Netlify): calls /.netlify/functions/ai (server-side key, secure)
// In local dev with netlify dev: same URL works via local function emulation
const AI_ENDPOINT = '/.netlify/functions/ai';

async function callAI<T>(action: string, payload: Record<string, string>): Promise<T> {
  const res = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `AI request failed (${res.status})`);
  }

  return res.json();
}

export interface AITask {
  title: string;
  priority: Priority;
  status: Status;
  assignee: string | null;
  dueDate: string | null;
  description: string;
}

/** Parse natural language text into a structured task. */
export function aiCreateTask(text: string): Promise<AITask> {
  return callAI<AITask>('create_task', { text });
}

/** Generate a professional description for a task given its title. */
export async function aiGenerateDescription(title: string): Promise<string> {
  const data = await callAI<{ description: string }>('generate_description', { title });
  return data.description;
}

/** Suggest a priority level for a task. */
export function aiSuggestPriority(
  title: string,
  description?: string
): Promise<{ priority: Priority; reason: string }> {
  return callAI('suggest_priority', { title, description: description ?? '' });
}
