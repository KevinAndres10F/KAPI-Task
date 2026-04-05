import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Task, Status } from '../types';
import { useTasks } from '../hooks/useTasks';
import Column from './Column';
import BentoTaskCard from './BentoTaskCard';

interface DraggableBoardProps {
  statuses: { value: Status; label: string }[];
  onEdit: (task: Task) => void;
  onAddTask: (status?: Status) => void;
}

export default function DraggableBoard({ statuses, onEdit, onAddTask }: DraggableBoardProps) {
  const { tasks, moveTask, persistTasksOrder } = useTasks();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const handleDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      const task = tasks.find((t) => t.id === active.id);
      setActiveTask(task ?? null);
    },
    [tasks]
  );

  const handleDragOver = useCallback(
    ({ active, over }: DragOverEvent) => {
      if (!over || active.id === over.id) return;

      const activeTask = tasks.find((t) => t.id === active.id);
      if (!activeTask) return;

      // Check if dragging over a column container (status value as id)
      const overIsColumn = statuses.some((s) => s.value === over.id);
      const targetStatus = overIsColumn
        ? (over.id as Status)
        : tasks.find((t) => t.id === over.id)?.status;

      if (targetStatus && targetStatus !== activeTask.status) {
        void moveTask(activeTask.id, targetStatus, 0);
      }
    },
    [tasks, statuses, moveTask]
  );

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setActiveTask(null);
      if (!over || active.id === over.id) return;

      const dragged = tasks.find((t) => t.id === active.id);
      if (!dragged) return;

      const overIsColumn = statuses.some((s) => s.value === over.id);
      const targetStatus = overIsColumn
        ? (over.id as Status)
        : tasks.find((t) => t.id === over.id)?.status ?? dragged.status;

      const columnTasks = tasks
        .filter((t) => t.status === targetStatus)
        .sort((a, b) => a.order - b.order);

      if (dragged.status === targetStatus && !overIsColumn) {
        // Reorder within same column
        const oldIndex = columnTasks.findIndex((t) => t.id === active.id);
        const newIndex = columnTasks.findIndex((t) => t.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = arrayMove(columnTasks, oldIndex, newIndex).map(
            (t, i) => ({ ...t, order: i })
          );
          void persistTasksOrder(reordered);
        }
      } else {
        // Cross-column drop — final order at end of target column
        const newOrder = columnTasks.filter((t) => t.id !== dragged.id).length;
        void moveTask(dragged.id, targetStatus, newOrder);
      }
    },
    [tasks, statuses, moveTask, persistTasksOrder]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 md:gap-6 h-full">
        {statuses.map((status) => (
          <div key={status.value} className="flex-1 min-w-[280px]">
            <Column
              status={status.value}
              title={status.label}
              onEdit={onEdit}
              onAddTask={() => onAddTask(status.value)}
            />
          </div>
        ))}
      </div>

      {/* DragOverlay — renders a floating clone while dragging */}
      <DragOverlay>
        {activeTask ? (
          <BentoTaskCard
            task={activeTask}
            onEdit={() => {}}
            onDelete={() => {}}
            isDragOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
