import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import SortableTaskCard from './SortableTaskCard';
import type { Task, Status } from '../types';
import { useTasks } from '../hooks/useTasks';

interface ColumnProps {
  status: Status;
  title: string;
  onEdit: (task: Task) => void;
  onAddTask: () => void;
}

const COLUMN_CONFIG: Record<Status, { dot: string; badge: string; emptyIcon: string }> = {
  'todo':        { dot: 'bg-slate-400',   badge: 'bg-slate-100 text-slate-600',   emptyIcon: '📋' },
  'in-progress': { dot: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700',     emptyIcon: '⚡' },
  'done':        { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', emptyIcon: '✅' },
};

const Column: React.FC<ColumnProps> = ({ status, title, onEdit, onAddTask }) => {
  const { tasks, deleteTask } = useTasks();

  const columnTasks = tasks
    .filter((t) => t.status === status)
    .sort((a, b) => a.order - b.order);

  const taskIds = columnTasks.map((t) => t.id);
  const cfg = COLUMN_CONFIG[status];

  // Make the column a droppable target for cross-column drops
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      className={`
        flex flex-col rounded-2xl border transition-colors duration-200
        ${isOver ? 'border-indigo-300 bg-indigo-50/40' : 'border-gray-200/80 bg-gray-50/80'}
        min-h-[480px] max-h-[calc(100vh-160px)] overflow-hidden
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/60 bg-white/70 rounded-t-2xl flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
          <h2 className="text-sm font-semibold text-gray-800 tracking-tight">{title}</h2>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>
            {columnTasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          aria-label="Agregar tarea"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Droppable + Sortable task list */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 overscroll-contain">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {columnTasks.length > 0 ? (
              columnTasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <SortableTaskCard
                    task={task}
                    onEdit={onEdit}
                    onDelete={() => void deleteTask(task.id)}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-gray-200"
              >
                <span className="text-2xl mb-1.5">{cfg.emptyIcon}</span>
                <p className="text-xs font-medium text-gray-400">Sin tareas</p>
              </motion.div>
            )}
          </AnimatePresence>
        </SortableContext>
      </div>

      {/* Footer add button */}
      <div className="px-3 pb-3 pt-1 flex-shrink-0">
        <button
          onClick={onAddTask}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400
                     hover:text-gray-700 hover:bg-white rounded-xl transition-colors
                     border border-dashed border-gray-200 hover:border-gray-300"
        >
          <Plus size={14} />
          <span>Agregar tarea</span>
        </button>
      </div>
    </div>
  );
};

export default Column;
