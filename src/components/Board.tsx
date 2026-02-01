import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, List, Calendar as CalendarIcon } from 'lucide-react';
import Column from './Column';
import TaskModal from './TaskModal';
import Calendar from './Calendar';
import type { Task, Status } from '../types';
import { useTasks } from '../hooks/useTasks';

type ViewType = 'kanban' | 'table' | 'calendar';

interface BoardProps {
  userEmail?: string | null;
  onSignOut: () => void;
}

const STATUSES: { value: Status; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export default function Board({ userEmail, onSignOut }: BoardProps) {
  const { tasks } = useTasks();
  const [viewType, setViewType] = useState<ViewType>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">KAPI Task Board</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">Manage your projects efficiently</p>
            </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewType('kanban')}
                className={`p-2 sm:px-3 sm:py-2 rounded transition-all ${
                  viewType === 'kanban'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Kanban view"
                aria-label="Kanban view"
              >
                <LayoutGrid size={18} className="sm:w-[18px] sm:h-[18px] w-5 h-5" />
              </button>
              <button
                onClick={() => setViewType('table')}
                className={`p-2 sm:px-3 sm:py-2 rounded transition-all ${
                  viewType === 'table'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Table view"
                aria-label="Table view"
              >
                <List size={18} className="sm:w-[18px] sm:h-[18px] w-5 h-5" />
              </button>
              <button
                onClick={() => setViewType('calendar')}
                className={`p-2 sm:px-3 sm:py-2 rounded transition-all ${
                  viewType === 'calendar'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Calendar view"
                aria-label="Calendar view"
              >
                <CalendarIcon size={18} className="sm:w-[18px] sm:h-[18px] w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {userEmail && (
                <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[120px] sm:max-w-none">{userEmail}</span>
              )}
              <button
                onClick={onSignOut}
                className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
        {viewType === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {STATUSES.map((status) => (
              <Column
                key={status.value}
                status={status.value}
                title={status.label}
                onEdit={handleEditTask}
                onAddTask={handleAddTask}
              />
            ))}
          </div>
        ) : viewType === 'calendar' ? (
          <Calendar tasks={tasks} onTaskClick={handleEditTask} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <motion.tr
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">{task.title}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{task.status}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        task={selectedTask}
      />
    </div>
  );
}
