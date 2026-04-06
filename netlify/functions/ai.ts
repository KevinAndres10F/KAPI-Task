import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Handler } from '@netlify/functions';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const handler: Handler = async (event) => {
  // Handle CORS preflight
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
  let payload: Record<string, string>;

  try {
    ({ action, payload } = JSON.parse(event.body ?? '{}'));
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  try {
    let result: object;

    if (action === 'create_task') {
      const prompt = `Eres un asistente de gestión de proyectos. Extrae una tarea estructurada del siguiente texto en español.
Responde ÚNICAMENTE con un JSON válido, sin markdown, sin explicaciones:
{
  "title": "título conciso de la tarea (máx 80 caracteres)",
  "priority": "low|medium|high|critical",
  "status": "todo",
  "assignee": "nombre de la persona asignada o null",
  "dueDate": "fecha en formato YYYY-MM-DD o null",
  "description": "descripción breve de la tarea en español (máx 120 caracteres)"
}

Reglas de prioridad:
- critical: urgente, bloqueante, producción caída, seguridad
- high: importante, impacta usuarios, esta semana
- medium: mejora, no urgente, puede esperar días
- low: backlog, nice-to-have, sin deadline

Fecha actual: ${new Date().toISOString().slice(0, 10)}

Texto: "${payload.text}"`;

      const res = await model.generateContent(prompt);
      const raw = res.response.text().replace(/```json\n?|```\n?/g, '').trim();
      result = JSON.parse(raw);

    } else if (action === 'generate_description') {
      const prompt = `Eres un PM senior. Escribe una descripción profesional y concisa para esta tarea de gestión de proyectos.
La descripción debe incluir:
- Contexto/objetivo en 1-2 oraciones
- 2-3 criterios de aceptación en formato de lista

Responde SOLO el texto de la descripción (sin título, sin JSON). Máximo 120 palabras. En español.

Tarea: "${payload.title}"`;

      const res = await model.generateContent(prompt);
      result = { description: res.response.text().trim() };

    } else if (action === 'suggest_priority') {
      const prompt = `Eres un PM senior. Analiza esta tarea y sugiere su prioridad.
Responde ÚNICAMENTE con JSON válido, sin markdown:
{"priority":"low|medium|high|critical","reason":"razón breve en español (máx 60 caracteres)"}

Reglas:
- critical: bloqueante, producción, seguridad, sin esto nada funciona
- high: impacta usuarios activos, debe hacerse esta semana
- medium: mejora importante, puede esperar unos días
- low: backlog, optimización, sin deadline claro

Tarea: "${payload.title}"
${payload.description ? `Descripción: "${payload.description}"` : ''}`;

      const res = await model.generateContent(prompt);
      const raw = res.response.text().replace(/```json\n?|```\n?/g, '').trim();
      result = JSON.parse(raw);

    } else {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
    }

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(result) };

  } catch (err) {
    console.error('[AI Function Error]', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'AI request failed', detail: String(err) }),
    };
  }
};
