import { motion } from 'framer-motion';
import { Trash2, Edit2, Clock, CheckCircle2, Circle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Task, Status } from '../types';
import {
  PRIORITY_COLORS, PRIORITY_BADGE_CLASSES, PRIORITY_LABELS,
  STATUS_LABELS, STATUS_BADGE_CLASSES, STATUS_DOT_CLASSES,
} from '../types';
import { useTasks } from '../hooks/useTasks';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { updateTask } = useTasks();

  const handleStatusChange = async (newStatus: Status) => {
    if (newStatus !== task.status) {
      await updateTask(task.id, { status: newStatus });
    }
  };

  const completedSubtasks = task.subtasks?.filter(st => st.completed).length ?? 0;
  const totalSubtasks     = task.subtasks?.length ?? 0;
  const progressPct       = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className={`
        bg-white rounded-xl border border-gray-100 shadow-sm
        hover:shadow-md hover:border-gray-200
        transition-all duration-200 group
        border-l-4 ${PRIORITY_COLORS[task.priority]}
        overflow-hidden
      `}
    >
      {/* Card body */}
      <div className="p-4">
        {/* Header row: title + actions */}
        <div className="flex items-start gap-2 mb-2">
          <button
            onClick={() => onEdit(task)}
            className="flex-1 text-left"
          >
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug
                           group-hover:text-indigo-600 transition-colors">
              {task.title}
            </h3>
          </button>

          {/* Action buttons — always visible on mobile, hover on desktop */}
          <div className="flex gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
              title="Editar"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              title="Eliminar"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Priority + Status badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE_CLASSES[task.priority]}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_CLASSES[task.status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_CLASSES[task.status]}`} />
            {STATUS_LABELS[task.status]}
          </span>
        </div>

        {/* Subtasks progress */}
        {totalSubtasks > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                {completedSubtasks === totalSubtasks
                  ? <CheckCircle2 size={11} className="text-emerald-500" />
                  : <Circle size={11} />}
                <span>Subtareas</span>
              </div>
              <span className="text-xs font-medium text-gray-500">
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={`h-1.5 rounded-full ${progressPct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer row: assignee + due date + status selector */}
      <div className="px-4 pb-3 pt-0 flex items-center gap-2 border-t border-gray-50 mt-1">
        {/* Assignee avatar */}
        {task.assignee && (
          <div
            className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0"
            title={task.assignee}
          >
            {task.assignee.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Due date */}
        {task.dueDate && (
          <div className={`flex items-center gap-1 text-xs flex-shrink-0 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
            <Clock size={11} />
            <span>
              {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true, locale: es })}
            </span>
          </div>
        )}

        {/* Status quick-change */}
        <select
          value={task.status}
          onChange={e => void handleStatusChange(e.target.value as Status)}
          onClick={e => e.stopPropagation()}
          className="ml-auto text-xs border border-gray-200 rounded-md px-1.5 py-1 bg-white
                     text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-400
                     cursor-pointer hover:border-gray-300 transition-colors"
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
    </motion.div>
  );
}
