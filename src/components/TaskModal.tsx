import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task, Priority, Status } from '../types';
import { PRIORITY_LABELS, PRIORITY_BADGE_CLASSES, PRIORITY_DOT_CLASSES, STATUS_LABELS } from '../types';
import { useTasks } from '../hooks/useTasks';

interface TaskModalProps {
  isOpen: boolean;
  task?: Task | null;
  onClose: () => void;
}

const PRIORITY_OPTIONS: Priority[] = ['low', 'medium', 'high', 'critical'];
const STATUS_OPTIONS:   Status[]   = ['todo', 'in-progress', 'done'];

export default function TaskModal({ isOpen, task, onClose }: TaskModalProps) {
  const { addTask, updateTask } = useTasks();
  const [title,          setTitle]          = useState('');
  const [description,    setDescription]    = useState('');
  const [priority,       setPriority]       = useState<Priority>('medium');
  const [status,         setStatus]         = useState<Status>('todo');
  const [assignee,       setAssignee]       = useState('');
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

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 overscroll-contain">
              {/* Title */}
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

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Descripción
                </label>
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
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 py-4 flex items-center gap-3 justify-end flex-shrink-0 bg-gray-50/50">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!title.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {task ? 'Guardar cambios' : 'Crear tarea'}
              </button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
