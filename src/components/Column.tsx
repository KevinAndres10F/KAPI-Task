import React, { useState } from 'react';
import {
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
  const columnTasks = tasks.filter((task) => task.status === status);
  const taskIds = columnTasks.map((task) => task.id);

  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

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
      className={`rounded-xl border-2 transition-all duration-200 ${getStatusColor()} ${
        isOver ? 'scale-105 shadow-xl' : 'shadow-sm'
      } flex flex-col h-[600px] min-w-[320px] overflow-hidden`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
            {columnTasks.length}
          </span>
        </div>
        {isHovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onAddTask}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
            title="Add task"
          >
            <Plus size={18} />
          </motion.button>
        )}
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-3 space-y-2"
      >
        <SortableContext
          items={taskIds}
          strategy={verticalListSortingStrategy}
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
                >
                  <TaskCard
                    task={task}
                    onEdit={onEdit}
                    onDelete={() => deleteTask(task.id)}
                  />
                </motion.div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <p className="text-gray-400 text-sm">No tasks yet</p>
                  <p className="text-gray-300 text-xs mt-1">Drag tasks here or add one</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </SortableContext>
      </div>
    </motion.div>
  );
};

export default Column;
