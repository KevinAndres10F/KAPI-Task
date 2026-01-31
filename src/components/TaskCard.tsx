import { motion } from 'framer-motion';
import { Trash2, Edit2, Clock } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Task } from '../types';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-grab active:cursor-grabbing border-l-4 ${
        isDragging ? 'opacity-50 shadow-xl' : ''
      } ${
        PRIORITY_COLORS[task.priority]
      }`}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between gap-2 mb-3"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(task);
        }}
      >
        <h3 className="font-semibold text-gray-900 flex-1 line-clamp-2 text-sm hover:text-blue-600 cursor-pointer">
          {task.title}
        </h3>
        <div
          className="flex gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(task)}
            className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(task.id)}
            className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </motion.button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Priority Badge */}
      <div className="mb-3">
        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Subtasks</span>
            <span className="text-xs font-medium text-gray-700">
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full"
            />
          </div>
        </div>
      )}

      {/* Assignee */}
      {task.assignee && (
        <div className="flex items-center gap-2 mb-3 text-xs">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
            {task.assignee.charAt(0).toUpperCase()}
          </div>
          <span className="text-gray-700">{task.assignee}</span>
        </div>
      )}

      {/* Due Date */}
      {task.dueDate && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock size={12} />
          <span>
            {formatDistanceToNow(new Date(task.dueDate), {
              addSuffix: true,
              locale: es,
            })}
          </span>
        </div>
      )}
    </motion.div>
  );
}
