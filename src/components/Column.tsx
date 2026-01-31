import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { Task, Column } from '../types';

interface ColumnProps {
  column: Column;
  onAddTask?: () => void;
  onDeleteTask?: (id: string) => void;
  onEditTask?: (task: Task) => void;
}

export const ColumnComponent: React.FC<ColumnProps> = ({
  column,
  onAddTask,
  onDeleteTask,
  onEditTask,
}) => {
  return (
    <div className="flex-1 min-w-80 max-w-lg">
      <div className="card-smooth bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {column.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {column.tasks.length} {column.tasks.length === 1 ? 'tarea' : 'tareas'}
              </p>
            </div>
            {onAddTask && (
              <button
                onClick={onAddTask}
                className="btn-primary p-2"
                title="Agregar tarea"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Tasks Container */}
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 overflow-y-auto p-4 ${
                snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/10' : ''
              }`}
            >
              {column.tasks.length === 0 && (
                <div className="flex items-center justify-center h-32 text-center">
                  <p className="text-gray-400 dark:text-gray-600 text-sm">
                    No hay tareas aquí
                  </p>
                </div>
              )}

              {column.tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onDelete={onDeleteTask}
                  onEdit={onEditTask}
                />
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};
