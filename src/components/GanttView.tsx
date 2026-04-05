import { useMemo } from 'react';
import { addDays, format, differenceInDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Task } from '../types';
import { PRIORITY_DOT_CLASSES } from '../types';

interface GanttViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

const STATUS_BAR: Record<string, string> = {
  'todo':        'bg-slate-300',
  'in-progress': 'bg-indigo-500',
  'done':        'bg-emerald-500',
};

const DAYS = 28; // show 28-day window

export default function GanttView({ tasks, onEdit }: GanttViewProps) {
  const today = startOfDay(new Date());
  const start = addDays(today, -7);  // 7 days before today
  const days = useMemo(() => Array.from({ length: DAYS }, (_, i) => addDays(start, i)), [start]);

  const withDates = tasks.filter((t) => t.dueDate);
  const withoutDates = tasks.filter((t) => !t.dueDate);

  const getBarStyle = (task: Task) => {
    if (!task.dueDate) return null;
    const dueDate = startOfDay(new Date(task.dueDate));
    // Estimate start as 3 days before due (simplified — no start date field yet)
    const taskStart = addDays(dueDate, -3);
    const windowStart = start;
    const windowEnd = addDays(start, DAYS - 1);

    const clampedStart = taskStart < windowStart ? windowStart : taskStart;
    const clampedEnd   = dueDate > windowEnd ? windowEnd : dueDate;

    if (clampedStart > windowEnd || clampedEnd < windowStart) return null;

    const left = differenceInDays(clampedStart, windowStart);
    const width = Math.max(1, differenceInDays(clampedEnd, clampedStart) + 1);

    return { left: `${(left / DAYS) * 100}%`, width: `${(width / DAYS) * 100}%` };
  };

  const isToday = (day: Date) => differenceInDays(day, today) === 0;

  return (
    <div className="p-4 sm:p-6 animate-fadeIn">
      <div className="card overflow-x-auto">
        {/* Header: day labels */}
        <div className="flex border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="w-48 flex-shrink-0 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-100">
            Tarea
          </div>
          <div className="flex-1 flex min-w-[560px]">
            {days.map((day, i) => (
              <div
                key={i}
                className={`flex-1 text-center py-2 text-[10px] font-medium border-r border-gray-50 last:border-0 ${
                  isToday(day) ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-gray-400'
                }`}
              >
                {format(day, 'dd', { locale: es })}
                <div className={`text-[9px] ${isToday(day) ? 'text-indigo-400' : 'text-gray-300'}`}>
                  {format(day, 'EEE', { locale: es })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {withDates.map((task) => {
            const bar = getBarStyle(task);
            return (
              <div key={task.id} className="flex items-center hover:bg-gray-50 transition-colors group">
                {/* Task name */}
                <button
                  onClick={() => onEdit(task)}
                  className="w-48 flex-shrink-0 px-4 py-3 text-left border-r border-gray-100"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT_CLASSES[task.priority]}`} />
                    <span className={`text-xs font-medium truncate ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {task.title}
                    </span>
                  </div>
                </button>

                {/* Bar track */}
                <div className="flex-1 relative h-10 min-w-[560px]">
                  {/* Today line */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-indigo-300 z-10 opacity-60"
                    style={{ left: `${(7 / DAYS) * 100}%` }}
                  />
                  {bar && (
                    <div
                      className={`absolute top-2 bottom-2 rounded-full ${STATUS_BAR[task.status]} opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer`}
                      style={{ left: bar.left, width: bar.width }}
                      onClick={() => onEdit(task)}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {withoutDates.map((task) => (
            <div key={task.id} className="flex items-center hover:bg-gray-50 transition-colors opacity-40">
              <button
                onClick={() => onEdit(task)}
                className="w-48 flex-shrink-0 px-4 py-3 text-left border-r border-gray-100"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT_CLASSES[task.priority]}`} />
                  <span className="text-xs text-gray-400 truncate">{task.title}</span>
                </div>
              </button>
              <div className="flex-1 flex items-center px-4 min-w-[560px]">
                <span className="text-xs text-gray-300">Sin fecha límite</span>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-400">
              Sin tareas para mostrar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
