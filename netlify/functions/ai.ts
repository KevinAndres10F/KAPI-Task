import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Handler } from '@netlify/functions';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Models tried in order — skips on 429 quota or 404 not-found errors
const MODEL_CASCADE = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b',
];

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

  async function generate(prompt: string): Promise<string> {
    let lastErr: unknown;
    for (const modelName of MODEL_CASCADE) {
      try {
        const m = genAI.getGenerativeModel({ model: modelName });
        const res = await m.generateContent(prompt);
        return res.response.text();
      } catch (err) {
        const msg = String(err);
        if (msg.includes('429') || msg.includes('quota') || msg.includes('404') || msg.includes('not found')) {
          lastErr = err;
          continue;
        }
        throw err;
      }
    }
    throw lastErr;
  }

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

      const raw = (await generate(prompt)).replace(/```json\n?|```\n?/g, '').trim();
      result = JSON.parse(raw);

    // ── Generate Description ──────────────────────────────────────────────────
    } else if (action === 'generate_description') {
      const title = payload.title as string;
      const prompt = `Eres un PM senior. Escribe una descripción profesional concisa para esta tarea.
Incluye: objetivo en 1-2 oraciones + 2-3 criterios de aceptación en lista.
Responde SOLO el texto (sin título, sin JSON). Máx 120 palabras. En español.
Tarea: "${title}"`;

      result = { description: (await generate(prompt)).trim() };

    // ── Suggest Priority ──────────────────────────────────────────────────────
    } else if (action === 'suggest_priority') {
      const title = payload.title as string;
      const description = (payload.description as string) ?? '';
      const prompt = `Analiza esta tarea y sugiere su prioridad.
Responde ÚNICAMENTE con JSON válido sin markdown:
{"priority":"low|medium|high|critical","reason":"razón breve en español (máx 60 chars)"}
Tarea: "${title}"${description ? `\nDescripción: "${description}"` : ''}`;

      const raw = (await generate(prompt)).replace(/```json\n?|```\n?/g, '').trim();
      result = JSON.parse(raw);

    // ── Kapibot Chat ──────────────────────────────────────────────────────────
    } else if (action === 'chat') {
      const messages = payload.messages as Array<{ role: 'user' | 'model'; content: string }>;
      const boardContext = payload.boardContext as string;

      const conversationHistory = messages
        .slice(0, -1)
        .map(m => `${m.role === 'user' ? 'USUARIO' : 'KAPIBOT'}: ${m.content}`)
        .join('\n\n');

      const lastUserMessage = messages[messages.length - 1].content;

      const prompt = `Eres Kapibot, el asistente IA de KAPI — una app de gestión de proyectos tipo Jira/Trello.

PERSONALIDAD:
- Eres experto en metodologías ágiles (Scrum, Kanban), gestión de proyectos y productividad
- Eres directo, útil y usas un tono profesional pero cercano
- Siempre respondes en español
- Conoces en detalle TODO el tablero del usuario (títulos, prioridades, fechas, asignados)
- Puedes recomendar qué hacer primero basándote en prioridad, fechas y carga de trabajo
- Detectas riesgos: tareas vencidas, bloqueos, falta de asignados, sobrecarga

CAPACIDADES:
1. Responder preguntas sobre cualquier tarea del tablero por nombre o estado
2. Sugerir priorización inteligente (urgencia × impacto)
3. Detectar cuellos de botella y riesgos del proyecto
4. Crear tareas estructuradas a partir de lenguaje natural
5. Dar recomendaciones de metodología ágil y buenas prácticas
6. Analizar la velocidad y salud del equipo

═══════════════════════════════════════
ESTADO COMPLETO DEL TABLERO:
${boardContext}
═══════════════════════════════════════

FORMATO DE RESPUESTA — usa SIEMPRE JSON válido (sin markdown, sin bloques de código):

Para CREAR UNA TAREA (cuando el usuario lo pide explícitamente):
{"action":"create_task","task":{"title":"título claro y accionable","priority":"low|medium|high|critical","status":"todo","assignee":null,"dueDate":null,"description":"descripción con criterios de aceptación"},"message":"mensaje confirmando la creación"}

Para TODO LO DEMÁS:
{"action":null,"message":"respuesta clara y útil en español, con saltos de línea si necesitas listas"}

REGLAS:
- Cita los títulos EXACTOS de las tareas cuando las menciones
- Si el usuario pregunta por tareas completadas, lista TODAS las que están en estado Completada
- Sé específico, no genérico — el usuario puede ver el tablero, dale información que él no ve fácilmente
- Si hay tareas vencidas o críticas, mencionarlas proactivamente en tu respuesta

${conversationHistory ? `CONVERSACIÓN ANTERIOR:\n${conversationHistory}\n\n` : ''}USUARIO: ${lastUserMessage}
KAPIBOT:`;

      const raw = (await generate(prompt)).replace(/```json\n?|```\n?/g, '').trim();

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
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'AI request failed', detail: String(err) }),
    };
  }
};
