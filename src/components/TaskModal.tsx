import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, Trash2, CheckCircle2, Circle, BookTemplate, Sparkles, Loader2 } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task, Priority, Status } from '../types';
import { PRIORITY_LABELS, PRIORITY_BADGE_CLASSES, PRIORITY_DOT_CLASSES, STATUS_LABELS } from '../types';
import { useTasks } from '../hooks/useTasks';
import TaskComments from './TaskComments';
import { aiGenerateDescription, aiSuggestPriority } from '../lib/geminiClient';

interface TaskModalProps {
  isOpen: boolean;
  task?: Task | null;
  onClose: () => void;
  onSaveTemplate?: (name: string, task: Omit<Task, 'id' | 'order'>) => void;
  currentUser?: string | null;
}

const PRIORITY_OPTIONS: Priority[] = ['low', 'medium', 'high', 'critical'];
const STATUS_OPTIONS:   Status[]   = ['todo', 'in-progress', 'done'];

export default function TaskModal({ isOpen, task, onClose, onSaveTemplate, currentUser }: TaskModalProps) {
  const { addTask, updateTask } = useTasks();
  const [title,          setTitle]          = useState('');
  const [description,    setDescription]    = useState('');
  const [priority,       setPriority]       = useState<Priority>('medium');
  const [status,         setStatus]         = useState<Status>('todo');
  const [assignee,       setAssignee]       = useState('');
  const [templateName,   setTemplateName]   = useState('');
  const [showTplInput,   setShowTplInput]   = useState(false);
  const [activeTab,      setActiveTab]      = useState<'details' | 'comments'>('details');
  const [aiDescLoading,  setAiDescLoading]  = useState(false);
  const [aiPrioLoading,  setAiPrioLoading]  = useState(false);
  const [dueDate,        setDueDate]        = useState('');
  const [subtasks,       setSubtasks]       = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtask,     setNewSubtask]     = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setAssignee(task.assignee || '');
      setDueDate(task.dueDate || '');
      setSubtasks(task.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setAssignee('');
      setDueDate('');
      setSubtasks([]);
    }
    setNewSubtask('');
  }, [task, isOpen]);

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks(prev => [...prev, { id: crypto.randomUUID(), title: newSubtask.trim(), completed: false }]);
      setNewSubtask('');
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const data = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      assignee: assignee.trim() || undefined,
      dueDate: dueDate || undefined,
      subtasks,
    };
    if (task) {
      void updateTask(task.id, data);
    } else {
      void addTask({ ...data, status: data.status ?? 'todo' });
    }
    onClose();
  };

  const completedCount = subtasks.filter(s => s.completed).length;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />

        {/* Content */}
        <Dialog.Content
          className="
            fixed left-0 sm:left-1/2 top-0 sm:top-1/2
            z-50 w-full sm:w-[680px] sm:max-w-[95vw]
            h-full sm:h-auto sm:max-h-[90vh]
            sm:-translate-x-1/2 sm:-translate-y-1/2
            rounded-none sm:rounded-2xl
            bg-white shadow-2xl
            overflow-hidden flex flex-col
            focus:outline-none
          "
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 flex-shrink-0">
              <div>
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  {task ? 'Editar tarea' : 'Nueva tarea'}
                </Dialog.Title>
                <p className="text-xs text-gray-400 mt-0.5">
                  {task ? 'Actualiza los detalles de la tarea' : 'Completa los detalles para crear la tarea'}
                </p>
              </div>
              <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                <X size={18} />
              </Dialog.Close>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6">
              {(['details', 'comments'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'details' ? 'Detalles' : 'Comentarios'}
                </button>
              ))}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 overscroll-contain">
              {/* Title — always visible */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Nombre de la tarea..."
                  className="input"
                  autoFocus
                />
              </div>

              {/* Details tab content */}
              {activeTab === 'details' && (<>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!title.trim() || aiPrioLoading || aiDescLoading}
                      onClick={async () => {
                        if (!title.trim()) return;
                        setAiPrioLoading(true);
                        try {
                          const { priority: p } = await aiSuggestPriority(title, description);
                          setPriority(p);
                        } catch { /* silent */ } finally { setAiPrioLoading(false); }
                      }}
                      className="flex items-center gap-1 text-[11px] text-purple-500 hover:text-purple-700
                                 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-full transition-colors
                                 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {aiPrioLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                      Sugerir prioridad
                    </button>
                    <button
                      type="button"
                      disabled={!title.trim() || aiDescLoading || aiPrioLoading}
                      onClick={async () => {
                        if (!title.trim()) return;
                        setAiDescLoading(true);
                        try {
                          const desc = await aiGenerateDescription(title);
                          setDescription(desc);
                        } catch { /* silent */ } finally { setAiDescLoading(false); }
                      }}
                      className="flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-700
                                 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-full transition-colors
                                 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {aiDescLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                      Generar con IA
                    </button>
                  </div>
                </div>
                <RichTextEditor
                  content={description}
                  onChange={setDescription}
                />
              </div>

              {/* Priority + Status + Assignee + Due Date */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Priority */}
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider">
                    Prioridad
                  </label>
                  <div className="space-y-1">
                    {PRIORITY_OPTIONS.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`
                          w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium
                          transition-colors border
                          ${priority === p
                            ? `${PRIORITY_BADGE_CLASSES[p]} border-current/30`
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                          }
                        `}
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT_CLASSES[p]}`} />
                        {PRIORITY_LABELS[p]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider">
                    Estado
                  </label>
                  <div className="space-y-1">
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={`
                          w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium
                          transition-colors border
                          ${status === s
                            ? s === 'todo'        ? 'bg-slate-100 text-slate-700 border-slate-200'
                              : s === 'in-progress' ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                          }
                        `}
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          s === 'todo' ? 'bg-slate-400' : s === 'in-progress' ? 'bg-blue-500' : 'bg-emerald-500'
                        }`} />
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assignee + Due date */}
                <div className="col-span-2 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider">
                      Asignado a
                    </label>
                    <input
                      type="text"
                      value={assignee}
                      onChange={e => setAssignee(e.target.value)}
                      placeholder="Nombre o email"
                      className="input py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider">
                      Fecha límite
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="input py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Subtasks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Subtareas
                  </label>
                  {subtasks.length > 0 && (
                    <span className="text-xs text-gray-400">
                      {completedCount}/{subtasks.length} completadas
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {subtasks.length > 0 && (
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
                    <motion.div
                      className="bg-indigo-500 h-1.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(completedCount / subtasks.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}

                {/* Subtask list */}
                <div className="space-y-1.5 mb-3">
                  <AnimatePresence>
                    {subtasks.map(st => (
                      <motion.div
                        key={st.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg group/st"
                      >
                        <button
                          type="button"
                          onClick={() => setSubtasks(prev =>
                            prev.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s)
                          )}
                          className="flex-shrink-0 text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          {st.completed
                            ? <CheckCircle2 size={16} className="text-emerald-500" />
                            : <Circle size={16} />
                          }
                        </button>
                        <span className={`flex-1 text-sm min-w-0 ${st.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {st.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSubtasks(prev => prev.filter(s => s.id !== st.id))}
                          className="p-1 opacity-0 group-hover/st:opacity-100 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Add subtask input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                    placeholder="Agregar subtarea..."
                    className="input py-2 flex-1"
                  />
                  <button
                    type="button"
                    onClick={addSubtask}
                    className="px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              </>)}

              {/* Comments tab content */}
              {activeTab === 'comments' && task && (
                <TaskComments taskId={task.id} currentUser={currentUser} />
              )}
              {activeTab === 'comments' && !task && (
                <p className="text-sm text-gray-400 text-center py-6">Guarda la tarea primero para agregar comentarios.</p>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 py-4 flex items-center gap-3 flex-shrink-0 bg-gray-50/50">
              {/* Save as template */}
              {onSaveTemplate && (
                <div className="flex items-center gap-2 flex-1">
                  {showTplInput ? (
                    <>
                      <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Nombre de plantilla..."
                        className="input py-1.5 text-xs flex-1"
                        autoFocus
                      />
                      <button
                        type="button"
                        disabled={!templateName.trim() || !title.trim()}
                        onClick={() => {
                          onSaveTemplate(templateName.trim(), { title, description, priority, status, assignee: assignee || undefined, dueDate: dueDate || undefined, subtasks });
                          setTemplateName('');
                          setShowTplInput(false);
                        }}
                        className="btn-secondary py-1.5 text-xs"
                      >
                        Guardar
                      </button>
                      <button type="button" onClick={() => setShowTplInput(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowTplInput(true)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <BookTemplate size={13} />
                      Guardar como plantilla
                    </button>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3 ml-auto">
                <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!title.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {task ? 'Guardar cambios' : 'Crear tarea'}
                </button>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
