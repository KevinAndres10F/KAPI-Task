import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Task, Priority } from '../types';
import { PRIORITY_LABELS } from '../types';
import { useTasks } from '../hooks/useTasks';

interface TaskModalProps {
  isOpen: boolean;
  task?: Task | null;
  onClose: () => void;
}

const PRIORITY_OPTIONS: Priority[] = ['low', 'medium', 'high', 'critical'];

export default function TaskModal({ isOpen, task, onClose }: TaskModalProps) {
  const { addTask, updateTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setAssignee(task.assignee || '');
      setDueDate(task.dueDate || '');
      setSubtasks(task.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setAssignee('');
      setDueDate('');
      setSubtasks([]);
    }
    setNewSubtaskTitle('');
  }, [task, isOpen]);

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      setSubtasks([
        ...subtasks,
        {
          id: crypto.randomUUID(),
          title: newSubtaskTitle.trim(),
          completed: false,
        },
      ]);
      setNewSubtaskTitle('');
    }
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((st) =>
        st.id === id ? { ...st, completed: !st.completed } : st
      )
    );
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee: assignee.trim() || undefined,
      dueDate: dueDate || undefined,
      subtasks,
    };

    if (task) {
      void updateTask(task.id, taskData);
    } else {
      void addTask({
        ...taskData,
        status: 'todo',
      });
    }

    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-0 sm:left-[50%] top-0 sm:top-[50%] z-50 w-full sm:w-auto sm:max-w-2xl h-full sm:h-auto sm:-translate-x-1/2 sm:-translate-y-1/2 rounded-none sm:rounded-xl bg-white shadow-xl p-0 animate-in fade-in sm:zoom-in-95 slide-in-from-bottom sm:slide-in-from-left-1/2 sm:slide-in-from-top-[48%] overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4 sm:p-6 flex-shrink-0">
              <Dialog.Title className="text-xl sm:text-2xl font-bold text-gray-900">
                {task ? 'Edit Task' : 'Create New Task'}
              </Dialog.Title>
              <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95">
                <X size={20} className="text-gray-600" />
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto overscroll-contain">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5 sm:mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5 sm:mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add task details..."
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Priority, Assignee, Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5 sm:mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY_LABELS[p]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5 sm:mb-2">
                    Assignee
                  </label>
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="Name or email"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5 sm:mb-2">
                    Due Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Subtasks */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 sm:mb-3">
                  Subtasks
                </label>
                <div className="space-y-2 mb-3">
                  {subtasks.map((subtask) => (
                    <motion.div
                      key={subtask.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3 p-2 sm:p-2 bg-gray-50 rounded-lg group"
                    >
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => handleToggleSubtask(subtask.id)}
                        className="w-5 h-5 sm:w-4 sm:h-4 rounded border-gray-300 cursor-pointer flex-shrink-0"
                      />
                      <span
                        className={`flex-1 text-sm sm:text-sm ${
                          subtask.completed
                            ? 'line-through text-gray-500'
                            : 'text-gray-900'
                        }`}
                      >
                        {subtask.title}
                      </span>
                      <button
                        onClick={() => handleDeleteSubtask(subtask.id)}
                        className="p-1.5 sm:p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-red-100 text-red-600 rounded transition-all active:scale-95"
                        title="Delete subtask"
                      >
                        <Trash2 size={18} className="sm:w-4 sm:h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Add Subtask */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSubtask();
                      }
                    }}
                    placeholder="Add a subtask..."
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddSubtask}
                    className="px-3 sm:px-4 py-2.5 sm:py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors active:scale-95"
                  >
                    <Plus size={20} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 sm:p-6 flex gap-3 justify-end flex-shrink-0 bg-gray-50 sm:bg-transparent">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-2 text-gray-700 bg-white sm:bg-gray-100 border border-gray-300 sm:border-0 hover:bg-gray-200 rounded-lg transition-colors font-medium active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 rounded-lg transition-colors font-medium active:scale-95"
              >
                {task ? 'Update' : 'Create'} Task
              </button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
