import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import type { Task, Status } from '../types';
import { useTasks } from '../hooks/useTasks';

interface ColumnProps {
  status: Status;
  title: string;
  onEdit: (task: Task) => void;
  onAddTask: () => void;
}

const Column: React.FC<ColumnProps> = ({ status, title, onEdit, onAddTask }) => {
  const { tasks, deleteTask } = useTasks();
  const [isHovered, setIsHovered] = useState(false);

  // Filtrar tareas por estado
  const columnTasks = tasks
    .filter((task) => task.status === status)
    .sort((a, b) => a.order - b.order);

  const getStatusColor = () => {
    switch (status) {
      case 'todo':
        return 'bg-slate-50 border-slate-200';
      case 'in-progress':
        return 'bg-blue-50 border-blue-200';
      case 'done':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-slate-50';
    }
  };

  return (
    <motion.div
      className={`rounded-xl border-2 transition-all duration-200 ${getStatusColor()} shadow-sm flex flex-col h-[calc(100vh-180px)] sm:h-[600px] min-h-[400px] overflow-hidden touch-pan-y`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900">{title}</h2>
          <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full">
            {columnTasks.length}
          </span>
        </div>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0.7, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={onAddTask}
          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors active:scale-95"
          title="Add task"
          aria-label="Add new task"
        >
          <Plus size={20} className="sm:w-[18px] sm:h-[18px]" />
        </motion.button>
      </div>

      {/* Tasks Container */}
      <div
        className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 overscroll-contain"
      >
        <AnimatePresence>
          {columnTasks.length > 0 ? (
            columnTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="group"
              >
                <TaskCard
                  task={task}
                  onEdit={onEdit}
                  onDelete={() => void deleteTask(task.id)}
                />
              </motion.div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-center px-4">
              <div>
                <p className="text-gray-400 text-sm">No hay tareas aún</p>
                <p className="text-gray-300 text-xs mt-1">Agrega una nueva tarea</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Column;
