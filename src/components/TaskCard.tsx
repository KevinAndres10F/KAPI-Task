import { Draggable } from '@hello-pangea/dnd';
import { Trash2, Edit2 } from 'lucide-react';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  index: number;
  onDelete?: (id: string) => void;
  onEdit?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index, onDelete, onEdit }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`card-smooth bg-white dark:bg-gray-800 p-4 mb-3 cursor-move hover:shadow-md transition-all ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {task.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                {task.description}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {onEdit && (
                <button
                  onClick={() => onEdit(task)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Editar"
                >
                  <Edit2 size={16} className="text-gray-500 dark:text-gray-400" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
