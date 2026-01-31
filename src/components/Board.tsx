import { useState } from 'react';
import type {
  DragOverEvent,
} from '@dnd-kit/core';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { LayoutGrid, List } from 'lucide-react';
import Column from './Column';
import TaskModal from './TaskModal';
import type { Task, Status } from '../types';
import { useTasks } from '../hooks/useTasks';

type ViewType = 'kanban' | 'table';

const STATUSES: { value: Status; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export default function Board() {
  const { tasks, moveTask } = useTasks();
  const [viewType, setViewType] = useState<ViewType>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overStatus = over.id as Status;

    if (activeTask.status !== overStatus) {
      moveTask(activeTask.id, overStatus, 0);
    }
  };

  const handleDragEnd = () => {
    // Drag end logic is mainly handled by DragOver
  };

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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">KAPI Task Board</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your projects efficiently</p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewType('kanban')}
              className={`px-3 py-2 rounded transition-all ${
                viewType === 'kanban'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Kanban view"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewType('table')}
              className={`px-3 py-2 rounded transition-all ${
                viewType === 'table'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Table view"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {viewType === 'kanban' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          </DndContext>
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
