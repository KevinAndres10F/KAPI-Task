import { useState } from 'react';
import type {
  DragEndEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { LayoutGrid, List } from 'lucide-react';
import Column from './Column';
import TaskModal from './TaskModal';
import type { Task, Status } from '../types';
import { useTasks } from '../hooks/useTasks';

type ViewType = 'kanban' | 'table';

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
  const { tasks, setTasks, persistTasksOrder } = useTasks();
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

  const getContainerId = (id: UniqueIdentifier) => {
    const statusMatch = STATUSES.find((status) => status.value === id);
    if (statusMatch) return statusMatch.value;

    const task = tasks.find((item) => item.id === id);
    return task?.status;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeContainer = getContainerId(active.id);
    const overContainer = getContainerId(over.id);

    if (!activeContainer || !overContainer) return;

    const activeTasks = tasks
      .filter((task) => task.status === activeContainer)
      .sort((a, b) => a.order - b.order);
    const overTasks = tasks
      .filter((task) => task.status === overContainer)
      .sort((a, b) => a.order - b.order);

    const activeIndex = activeTasks.findIndex((task) => task.id === active.id);
    const overIndex = overTasks.findIndex((task) => task.id === over.id);

    if (activeContainer === overContainer) {
      if (activeIndex === -1) return;

      const targetIndex = overIndex === -1 ? activeTasks.length - 1 : overIndex;
      if (activeIndex === targetIndex) return;

      const reordered = arrayMove(activeTasks, activeIndex, targetIndex).map(
        (task, index) => ({ ...task, order: index })
      );

      const otherTasks = tasks.filter((task) => task.status !== activeContainer);
      const nextTasks = [...otherTasks, ...reordered];

      setTasks(nextTasks);
      void persistTasksOrder(nextTasks);
      return;
    }

    if (activeIndex === -1) return;

    const [movedTask] = activeTasks.splice(activeIndex, 1);
    const destinationIndex = overIndex === -1 ? overTasks.length : overIndex;
    overTasks.splice(destinationIndex, 0, {
      ...movedTask,
      status: overContainer,
    });

    const normalizedActive = activeTasks.map((task, index) => ({
      ...task,
      order: index,
    }));
    const normalizedOver = overTasks.map((task, index) => ({
      ...task,
      order: index,
    }));

    const remainingTasks = tasks.filter(
      (task) => task.status !== activeContainer && task.status !== overContainer
    );

    const nextTasks = [...remainingTasks, ...normalizedActive, ...normalizedOver];
    setTasks(nextTasks);
    void persistTasksOrder(nextTasks);
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
          <div className="flex items-center gap-3">
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

            <div className="flex items-center gap-3">
              {userEmail && (
                <span className="text-sm text-gray-600">{userEmail}</span>
              )}
              <button
                onClick={onSignOut}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {viewType === 'kanban' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
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
