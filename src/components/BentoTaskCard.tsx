import { motion } from 'framer-motion';
import { Trash2, Edit2, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Task, Status } from '../types';
import {
  PRIORITY_COLORS,
  PRIORITY_BADGE_CLASSES,
  PRIORITY_DOT_CLASSES,
  PRIORITY_LABELS,
  STATUS_LABELS,
  STATUS_BADGE_CLASSES,
  STATUS_DOT_CLASSES,
} from '../types';
import { useTasks } from '../hooks/useTasks';
import RichTextViewer from './RichTextViewer';

interface BentoTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  /** When true, renders a lighter "ghost" clone used by DragOverlay */
  isDragOverlay?: boolean;
}

export default function BentoTaskCard({
  task,
  onEdit,
  onDelete,
  isDragOverlay = false,
}: BentoTaskCardProps) {
  const { updateTask } = useTasks();

  const handleStatusChange = async (newStatus: Status) => {
    if (newStatus !== task.status) await updateTask(task.id, { status: newStatus });
  };

  const completedSub = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const totalSub = task.subtasks?.length ?? 0;
  const subPct = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div
      data-task-card={task.id}
      className={`
        bg-white rounded-xl border border-gray-100
        ${isDragOverlay ? 'shadow-2xl opacity-90 rotate-1 scale-105' : 'shadow-sm hover:shadow-md hover:border-gray-200'}
        border-l-4 ${PRIORITY_COLORS[task.priority]}
        transition-shadow duration-200 overflow-hidden
        ${isDragOverlay ? '' : 'group'}
      `}
    >
      {/* ── Header row: priority dot + status pill + actions ── */}
      <div className="flex items-center gap-2 px-3.5 pt-3 pb-2.5">
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT_CLASSES[task.priority]}`}
          title={PRIORITY_LABELS[task.priority]}
        />
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE_CLASSES[task.priority]}`}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_CLASSES[task.status]}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_CLASSES[task.status]}`} />
          {STATUS_LABELS[task.status]}
        </span>

        {/* Actions — visible on hover desktop, always on mobile */}
        <div className="ml-auto flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Editar"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Eliminar"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* ── Bento body: 2-column grid ── */}
      <div className="grid grid-cols-[1fr_140px] border-t border-gray-50 min-h-[72px]">
        {/* Left: Title + Rich Text Preview */}
        <div
          className="px-3.5 py-2.5 cursor-pointer border-r border-gray-50"
          onClick={() => onEdit(task)}
        >
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-1.5 group-hover:text-indigo-600 transition-colors">
            {task.title}
          </h3>
          {task.description && (
            <div className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
              <RichTextViewer content={task.description} />
            </div>
          )}
        </div>

        {/* Right: Metadata sub-modules */}
        <div className="flex flex-col divide-y divide-gray-50">
          {/* Assignee */}
          <div className="px-2.5 py-2 flex items-center gap-2 bg-gray-50/40">
            {task.assignee ? (
              <>
                <div
                  className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0"
                  title={task.assignee}
                >
                  {task.assignee.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-gray-500 truncate">{task.assignee}</span>
              </>
            ) : (
              <span className="text-xs text-gray-300 italic">Sin asignar</span>
            )}
          </div>

          {/* Due Date */}
          <div className="px-2.5 py-2 flex items-center gap-1.5">
            {task.dueDate ? (
              <>
                {isOverdue
                  ? <AlertCircle size={11} className="text-red-500 flex-shrink-0" />
                  : <Clock size={11} className="text-gray-400 flex-shrink-0" />}
                <span className={`text-xs truncate ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                  {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true, locale: es })}
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-300">Sin fecha</span>
            )}
          </div>

          {/* Subtask Progress */}
          <div className="px-2.5 py-2 flex-1 flex flex-col justify-center">
            {totalSub > 0 ? (
              <>
                <div className="flex items-center justify-between mb-1">
                  {completedSub === totalSub
                    ? <CheckCircle2 size={10} className="text-emerald-500" />
                    : <Circle size={10} className="text-gray-300" />}
                  <span className="text-xs text-gray-400">{completedSub}/{totalSub}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${subPct}%` }}
                    transition={{ duration: 0.4 }}
                    className={`h-1 rounded-full ${subPct === 100 ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                  />
                </div>
              </>
            ) : (
              <span className="text-xs text-gray-300">Sin subtareas</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer row: quick status change ── */}
      <div className="border-t border-gray-50 px-3.5 py-2 flex items-center gap-2">
        <select
          value={task.status}
          onChange={(e) => void handleStatusChange(e.target.value as Status)}
          onClick={(e) => e.stopPropagation()}
          className="text-xs border border-gray-200 rounded-md px-1.5 py-1 bg-white text-gray-600
                     focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer
                     hover:border-gray-300 transition-colors"
        >
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        {task.created_at && (
          <span className="ml-auto text-xs text-gray-300 hidden sm:block">
            {formatDistanceToNow(new Date(task.created_at), { addSuffix: true, locale: es })}
          </span>
        )}
      </div>
    </div>
  );
}
