import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Loader2, Plus, Sparkles, ChevronDown } from 'lucide-react';
import { kapibotChat, type KapibotMessage, type AITask } from '../lib/geminiClient';
import type { Task } from '../types';
import { PRIORITY_BADGE_CLASSES, PRIORITY_DOT_CLASSES, PRIORITY_LABELS } from '../types';

interface Props {
  tasks: Task[];
  onCreateTask: (task: Omit<AITask, 'status'> & { status: Task['status'] }) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  pendingTask?: AITask;
  isTyping?: boolean;
}

const QUICK_PROMPTS = [
  '¿Qué tareas están vencidas?',
  'Crea una tarea de revisión de código',
  '¿Cómo va el proyecto?',
  'Sugiere qué hacer primero',
];

function buildBoardContext(tasks: Task[]): string {
  const total = tasks.length;
  const byStatus = {
    todo: tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };
  const overdue = tasks.filter(
    t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
  );
  const critical = tasks.filter(t => t.priority === 'critical' && t.status !== 'done');
  const today = new Date().toISOString().slice(0, 10);

  let ctx = `Fecha: ${today}. Total tareas: ${total}. `;
  ctx += `Por hacer: ${byStatus.todo}, En progreso: ${byStatus['in-progress']}, Completadas: ${byStatus.done}. `;
  if (overdue.length > 0) {
    ctx += `Vencidas (${overdue.length}): ${overdue.slice(0, 3).map(t => `"${t.title}"`).join(', ')}. `;
  }
  if (critical.length > 0) {
    ctx += `Críticas pendientes: ${critical.slice(0, 3).map(t => `"${t.title}"`).join(', ')}. `;
  }
  if (tasks.length > 0) {
    const inProg = tasks.filter(t => t.status === 'in-progress').slice(0, 3);
    if (inProg.length > 0) {
      ctx += `En progreso ahora: ${inProg.map(t => `"${t.title}"`).join(', ')}.`;
    }
  }
  return ctx;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-indigo-400 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function TaskCard({ task, onAccept }: { task: AITask; onAccept: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-2 bg-white border border-indigo-100 rounded-xl p-3 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-gray-800 leading-tight">{task.title}</p>
        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE_CLASSES[task.priority]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT_CLASSES[task.priority]}`} />
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>
      {task.description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
        {task.assignee && <span>👤 {task.assignee}</span>}
        {task.dueDate && <span>📅 {task.dueDate}</span>}
      </div>
      <button
        onClick={onAccept}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
      >
        <Plus size={13} />
        Agregar al tablero
      </button>
    </motion.div>
  );
}

export default function Kapibot({ tasks, onCreateTask }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: '¡Hola! Soy **Kapibot** 🤖, tu asistente de KAPI.\n\nPuedo ayudarte a crear tareas, analizar el tablero, sugerir prioridades y responder preguntas sobre el proyecto. ¿En qué te ayudo?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const acceptedTasks = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    const userText = text.trim();
    if (!userText || loading) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: userText };
    const typingMsg: ChatMessage = { id: 'typing', role: 'model', content: '', isTyping: true };

    setMessages(prev => [...prev, userMsg, typingMsg]);
    setInput('');
    setLoading(true);

    // Build history for API (exclude typing indicator and welcome)
    const history: KapibotMessage[] = [...messages, userMsg]
      .filter(m => m.id !== 'welcome' && !m.isTyping)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const boardContext = buildBoardContext(tasks);
      const response = await kapibotChat(history, boardContext);

      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        content: response.message,
        pendingTask: response.action === 'create_task' ? response.task : undefined,
      };

      setMessages(prev => prev.filter(m => m.id !== 'typing').concat(botMsg));
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        content: `Error al conectar con la IA: ${err instanceof Error ? err.message : String(err)}`,
      };
      setMessages(prev => prev.filter(m => m.id !== 'typing').concat(errorMsg));
      console.error('[Kapibot]', err);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, tasks]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleAcceptTask = (msgId: string, task: AITask) => {
    if (acceptedTasks.current.has(msgId)) return;
    acceptedTasks.current.add(msgId);
    onCreateTask({ ...task, status: 'todo' });
    setMessages(prev =>
      prev.map(m =>
        m.id === msgId ? { ...m, pendingTask: undefined, content: m.content + '\n\n✅ Tarea agregada al tablero.' } : m
      )
    );
  };

  // Render message content with basic markdown bold (**text**)
  function renderContent(text: string) {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className={i > 0 ? 'mt-1' : ''}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
        </p>
      );
    });
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl flex items-center justify-center"
        aria-label="Abrir Kapibot"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <ChevronDown size={22} />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Bot size={24} />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping bg-indigo-400 opacity-25 pointer-events-none" />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
                <Bot size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Kapibot</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs text-white/70">Asistente IA · Gemini 1.5 Flash</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth">
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'model' && (
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                        <Sparkles size={14} />
                      </div>
                    )}
                    <div className={`max-w-[82%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}
                      >
                        {msg.isTyping ? <TypingDots /> : renderContent(msg.content)}
                      </div>
                      {msg.pendingTask && (
                        <TaskCard
                          task={msg.pendingTask}
                          onAccept={() => handleAcceptTask(msg.id, msg.pendingTask!)}
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full border border-indigo-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3 pt-1 border-t border-gray-100">
              <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-indigo-400 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  placeholder="Escribe algo… (↵ enviar)"
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none max-h-24 min-h-[20px]"
                  style={{ height: 'auto' }}
                  onInput={e => {
                    const t = e.target as HTMLTextAreaElement;
                    t.style.height = 'auto';
                    t.style.height = `${Math.min(t.scrollHeight, 96)}px`;
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="shrink-0 w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
                  aria-label="Enviar"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-300 mt-1.5">Kapibot puede cometer errores · KAPI AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
