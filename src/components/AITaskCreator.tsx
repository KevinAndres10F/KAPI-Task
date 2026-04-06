import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, Loader2, AlertCircle, CheckCircle2, User, Calendar, Flag } from 'lucide-react';
import { aiCreateTask, type AITask } from '../lib/geminiClient';
import { useTasks } from '../hooks/useTasks';
import { PRIORITY_BADGE_CLASSES, PRIORITY_DOT_CLASSES, PRIORITY_LABELS, STATUS_LABELS } from '../types';

interface AITaskCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXAMPLES = [
  'Bug crítico en el login, bloquea a todos los usuarios, urge hoy',
  'Revisar diseño del dashboard con @Maria para el viernes',
  'Optimizar consultas lentas en la API de reportes, baja prioridad',
];

export default function AITaskCreator({ isOpen, onClose }: AITaskCreatorProps) {
  const { addTask } = useTasks();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AITask | null>(null);
  const [created, setCreated] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCreated(false);

    try {
      const task = await aiCreateTask(text.trim());
      setResult(task);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con la IA');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!result) return;
    await addTask({
      title: result.title,
      description: result.description,
      priority: result.priority,
      status: result.status,
      assignee: result.assignee ?? undefined,
      dueDate: result.dueDate ?? undefined,
      subtasks: [],
    });
    setCreated(true);
    setTimeout(() => {
      setText('');
      setResult(null);
      setCreated(false);
      onClose();
    }, 1200);
  };

  const handleClose = () => {
    setText('');
    setResult(null);
    setError(null);
    setCreated(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="ai-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            key="ai-panel"
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-[12vh] -translate-x-1/2 w-full max-w-[560px] px-4 z-[101]"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Crear tarea con IA</h2>
                    <p className="text-xs text-gray-500">Describe la tarea en lenguaje natural</p>
                  </div>
                </div>
                <button onClick={handleClose} className="p-1.5 hover:bg-white/80 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Input */}
                <div>
                  <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => { setText(e.target.value); setResult(null); setError(null); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
                    }}
                    placeholder="Ej: bug crítico en login para mañana @carlos..."
                    rows={3}
                    autoFocus
                    className="input resize-none text-sm w-full"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-1.5 flex-wrap">
                      {EXAMPLES.slice(0, 2).map((ex, i) => (
                        <button
                          key={i}
                          onClick={() => { setText(ex); setResult(null); }}
                          className="text-[10px] text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-full transition-colors truncate max-w-[160px]"
                        >
                          {ex.slice(0, 30)}…
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-300">⌘↵ generar</span>
                  </div>
                </div>

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={!text.trim() || loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4
                             bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                             rounded-xl text-sm font-medium shadow-sm
                             hover:from-indigo-700 hover:to-purple-700
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all"
                >
                  {loading ? (
                    <><Loader2 size={15} className="animate-spin" /> Analizando con Gemini...</>
                  ) : (
                    <><Sparkles size={15} /> Generar tarea <ArrowRight size={13} /></>
                  )}
                </button>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl"
                  >
                    <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600">{error}</p>
                  </motion.div>
                )}

                {/* Result preview */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="border border-indigo-100 rounded-xl overflow-hidden"
                    >
                      {/* Result header */}
                      <div className="px-4 py-2.5 bg-indigo-50/60 border-b border-indigo-100 flex items-center gap-2">
                        <Sparkles size={12} className="text-indigo-400" />
                        <span className="text-xs font-medium text-indigo-700">Vista previa generada por IA</span>
                      </div>

                      <div className="p-4 space-y-3">
                        {/* Title */}
                        <p className="font-semibold text-gray-900 text-sm leading-snug">{result.title}</p>

                        {/* Metadata chips */}
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${PRIORITY_BADGE_CLASSES[result.priority]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT_CLASSES[result.priority]}`} />
                            {PRIORITY_LABELS[result.priority]}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            <Flag size={10} />
                            {STATUS_LABELS[result.status]}
                          </span>
                          {result.assignee && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700">
                              <User size={10} />
                              {result.assignee}
                            </span>
                          )}
                          {result.dueDate && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                              <Calendar size={10} />
                              {result.dueDate}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {result.description && (
                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{result.description}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-t border-gray-100">
                        <button
                          onClick={() => { setResult(null); setTimeout(() => inputRef.current?.focus(), 50); }}
                          className="btn-secondary text-xs py-1.5 flex-1"
                        >
                          Editar texto
                        </button>
                        <button
                          onClick={handleCreate}
                          disabled={created}
                          className="flex items-center justify-center gap-1.5 flex-1 py-1.5 px-3
                                     bg-indigo-600 text-white rounded-lg text-xs font-medium
                                     hover:bg-indigo-700 transition-colors disabled:opacity-60"
                        >
                          {created ? (
                            <><CheckCircle2 size={13} className="text-emerald-300" /> Creada!</>
                          ) : (
                            <>Crear tarea</>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
