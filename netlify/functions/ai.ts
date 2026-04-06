import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Handler } from '@netlify/functions';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  if (!process.env.GOOGLE_AI_KEY) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'GOOGLE_AI_KEY not configured' }) };
  }

  let action: string;
  let payload: Record<string, unknown>;

  try {
    ({ action, payload } = JSON.parse(event.body ?? '{}'));
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  try {
    let result: object;

    // ── Create Task ───────────────────────────────────────────────────────────
    if (action === 'create_task') {
      const text = payload.text as string;
      const prompt = `Eres un asistente de gestión de proyectos. Extrae una tarea estructurada del siguiente texto en español.
Responde ÚNICAMENTE con un JSON válido, sin markdown, sin explicaciones:
{"title":"título conciso (máx 80 chars)","priority":"low|medium|high|critical","status":"todo","assignee":null,"dueDate":"YYYY-MM-DD o null","description":"descripción breve (máx 120 chars)"}

Reglas prioridad: critical=urgente/bloqueante, high=impacta usuarios esta semana, medium=puede esperar días, low=backlog
Fecha actual: ${new Date().toISOString().slice(0, 10)}
Texto: "${text}"`;

      const res = await model.generateContent(prompt);
      const raw = res.response.text().replace(/```json\n?|```\n?/g, '').trim();
      result = JSON.parse(raw);

    // ── Generate Description ──────────────────────────────────────────────────
    } else if (action === 'generate_description') {
      const title = payload.title as string;
      const prompt = `Eres un PM senior. Escribe una descripción profesional concisa para esta tarea.
Incluye: objetivo en 1-2 oraciones + 2-3 criterios de aceptación en lista.
Responde SOLO el texto (sin título, sin JSON). Máx 120 palabras. En español.
Tarea: "${title}"`;

      const res = await model.generateContent(prompt);
      result = { description: res.response.text().trim() };

    // ── Suggest Priority ──────────────────────────────────────────────────────
    } else if (action === 'suggest_priority') {
      const title = payload.title as string;
      const description = (payload.description as string) ?? '';
      const prompt = `Analiza esta tarea y sugiere su prioridad.
Responde ÚNICAMENTE con JSON válido sin markdown:
{"priority":"low|medium|high|critical","reason":"razón breve en español (máx 60 chars)"}
Tarea: "${title}"${description ? `\nDescripción: "${description}"` : ''}`;

      const res = await model.generateContent(prompt);
      const raw = res.response.text().replace(/```json\n?|```\n?/g, '').trim();
      result = JSON.parse(raw);

    // ── Kapibot Chat ──────────────────────────────────────────────────────────
    } else if (action === 'chat') {
      const messages = payload.messages as Array<{ role: 'user' | 'model'; content: string }>;
      const boardContext = payload.boardContext as string;

      // Build full conversation as a single formatted prompt (avoids startChat API quirks)
      const conversationHistory = messages
        .slice(0, -1)
        .map(m => `${m.role === 'user' ? 'USUARIO' : 'KAPIBOT'}: ${m.content}`)
        .join('\n\n');

      const lastUserMessage = messages[messages.length - 1].content;

      const prompt = `Eres Kapibot, el asistente de KAPI — app de gestión de proyectos (estilo Jira/Trello).
Eres amigable, conciso, experto en proyectos ágiles. Respondes SIEMPRE en español.

TABLERO ACTUAL: ${boardContext}

INSTRUCCIONES DE RESPUESTA — usa SIEMPRE JSON válido (sin markdown):
- Si el usuario quiere crear una tarea: {"action":"create_task","task":{"title":"...","priority":"low|medium|high|critical","status":"todo","assignee":null,"dueDate":null,"description":"..."},"message":"✅ Tarea creada: [título]"}
- Para todo lo demás: {"action":null,"message":"tu respuesta corta en español (máx 3 párrafos)"}

${conversationHistory ? `CONVERSACIÓN ANTERIOR:\n${conversationHistory}\n\n` : ''}USUARIO: ${lastUserMessage}
KAPIBOT:`;

      const res = await model.generateContent(prompt);
      const raw = res.response.text().replace(/```json\n?|```\n?/g, '').trim();

      try {
        result = JSON.parse(raw);
      } catch {
        result = { action: null, message: raw };
      }

    } else {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
    }

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(result) };

  } catch (err) {
    console.error('[AI Function Error]', err);
    // Return the actual error detail so frontend can display it
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'AI request failed', detail: String(err) }),
    };
  }
};
