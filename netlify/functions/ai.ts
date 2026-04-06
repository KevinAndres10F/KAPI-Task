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

  try {
    let result: object;

    // ── Create Task ───────────────────────────────────────────────────────────
    if (action === 'create_task') {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const text = payload.text as string;
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

Texto: "${text}"`;

      const res = await model.generateContent(prompt);
      const raw = res.response.text().replace(/```json\n?|```\n?/g, '').trim();
      result = JSON.parse(raw);

    // ── Generate Description ──────────────────────────────────────────────────
    } else if (action === 'generate_description') {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const title = payload.title as string;
      const prompt = `Eres un PM senior. Escribe una descripción profesional y concisa para esta tarea de gestión de proyectos.
La descripción debe incluir:
- Contexto/objetivo en 1-2 oraciones
- 2-3 criterios de aceptación en formato de lista

Responde SOLO el texto de la descripción (sin título, sin JSON). Máximo 120 palabras. En español.

Tarea: "${title}"`;

      const res = await model.generateContent(prompt);
      result = { description: res.response.text().trim() };

    // ── Suggest Priority ──────────────────────────────────────────────────────
    } else if (action === 'suggest_priority') {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const title = payload.title as string;
      const description = (payload.description as string) ?? '';
      const prompt = `Eres un PM senior. Analiza esta tarea y sugiere su prioridad.
Responde ÚNICAMENTE con JSON válido, sin markdown:
{"priority":"low|medium|high|critical","reason":"razón breve en español (máx 60 caracteres)"}

Reglas:
- critical: bloqueante, producción, seguridad, sin esto nada funciona
- high: impacta usuarios activos, debe hacerse esta semana
- medium: mejora importante, puede esperar unos días
- low: backlog, optimización, sin deadline claro

Tarea: "${title}"
${description ? `Descripción: "${description}"` : ''}`;

      const res = await model.generateContent(prompt);
      const raw = res.response.text().replace(/```json\n?|```\n?/g, '').trim();
      result = JSON.parse(raw);

    // ── Kapibot Chat ──────────────────────────────────────────────────────────
    } else if (action === 'chat') {
      const messages = payload.messages as Array<{ role: 'user' | 'model'; content: string }>;
      const boardContext = payload.boardContext as string;

      // Use systemInstruction for cleaner prompt injection (avoids startChat history quirks)
      const chatModel = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: `Eres Kapibot, el asistente inteligente de KAPI — una app de gestión de proyectos estilo Jira/Trello.
Eres amigable, conciso y experto en gestión de proyectos ágiles.
Siempre respondes en español, con respuestas cortas y directas (máx 3 párrafos).
Puedes ayudar con:
- Crear tareas
- Analizar el estado del tablero
- Sugerir prioridades, mejoras y buenas prácticas ágiles
- Responder preguntas sobre el proyecto

ESTADO ACTUAL DEL TABLERO:
${boardContext}

REGLAS DE RESPUESTA — responde SIEMPRE con JSON válido (sin markdown):

Si el usuario quiere crear una tarea:
{"action":"create_task","task":{"title":"...","priority":"low|medium|high|critical","status":"todo","assignee":null,"dueDate":null,"description":"..."},"message":"Listo, creé la tarea X para ti."}

Para cualquier otra consulta:
{"action":null,"message":"tu respuesta aquí"}`,
      });

      // Build alternating history (Gemini requires user/model alternation)
      // messages already include the current user message at the end
      const history = messages.slice(0, -1).map(m => ({
        role: m.role as 'user' | 'model',
        parts: [{ text: m.content }],
      }));

      const chat = chatModel.startChat({ history });
      const lastMessage = messages[messages.length - 1];
      const res = await chat.sendMessage(lastMessage.content);
      const raw = res.response.text().replace(/```json\n?|```\n?/g, '').trim();

      try {
        result = JSON.parse(raw);
      } catch {
        // Fallback: wrap plain text in expected shape
        result = { action: null, message: raw };
      }

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
