import { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { ColumnComponent } from './Column';
import type { Task, Column as ColumnType } from '../types';

interface BoardProps {
  columns: ColumnType[];
  onTasksChange?: (tasks: Task[]) => void;
  onAddTask?: (columnId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
}

export const Board: React.FC<BoardProps> = ({
  columns: initialColumns,
  onTasksChange,
  onAddTask,
  onDeleteTask,
  onEditTask,
}) => {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);

  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Si no hay destino válido, no hacer nada
    if (!destination) {
      return;
    }

    // Si la tarea se suelta en el mismo lugar, no hacer nada
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Crear una copia de las columnas
    const newColumns = columns.map((col) => ({
      ...col,
      tasks: [...col.tasks],
    }));

    // Encontrar las columnas de origen y destino
    const sourceColumn = newColumns.find((col) => col.id === source.droppableId);
    const destColumn = newColumns.find((col) => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    // Obtener la tarea
    const [task] = sourceColumn.tasks.splice(source.index, 1);

    // Actualizar el estado de la tarea si cambió de columna
    if (source.droppableId !== destination.droppableId) {
      task.status = destination.droppableId as Task['status'];
    }

    // Insertar en la columna destino
    destColumn.tasks.splice(destination.index, 0, task);

    // Actualizar órdenes
    newColumns.forEach((col) => {
      col.tasks.forEach((t, idx) => {
        t.order = idx;
      });
    });

    setColumns(newColumns);

    // Notificar cambios
    if (onTasksChange) {
      const allTasks = newColumns.flatMap((col) => col.tasks);
      onTasksChange(allTasks);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 min-h-screen overflow-x-auto">
        {columns.map((column) => (
          <ColumnComponent
            key={column.id}
            column={column}
            onAddTask={() => onAddTask?.(column.id)}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
          />
        ))}
      </div>
    </DragDropContext>
  );
};
