import { useState } from 'react';
import { ChevronLeft, ChevronRight as ChevronRightIcon, X, Calendar as CalIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Task } from '../types';
import { PRIORITY_BADGE_CLASSES, PRIORITY_DOT_CLASSES, PRIORITY_LABELS, STATUS_LABELS, STATUS_DOT_CLASSES } from '../types';

interface CalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const MONTH_NAMES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];
const DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

export default function Calendar({ tasks, onTaskClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year  === today.getFullYear();

  const getTasksForDate = (date: Date) => {
    const ds = date.toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate && new Date(t.dueDate).toISOString().split('T')[0] === ds);
  };

  // Build day cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const openDay = (day: number) => {
    setSelectedDate(new Date(year, month, day));
    setShowModal(true);
  };

  const selectedDayTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col gap-5">
      {/* Header */}
      <div className="card px-5 py-4 flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
          {MONTH_NAMES[month]} {year}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            Hoy
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1))}
            className="p-2 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1))}
            className="p-2 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card flex-1 overflow-hidden flex flex-col">
        {/* Day name headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAY_NAMES.map(d => (
            <div key={d} className="py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-gray-50 overflow-auto">
          {cells.map((day, i) => {
            if (!day) {
              return <div key={`e-${i}`} className="bg-gray-50/40 min-h-[80px]" />;
            }

            const date      = new Date(year, month, day);
            const dayTasks  = getTasksForDate(date);
            const isPast    = date < today;
            const isTod     = isToday(day);
            const hasOverdue = dayTasks.some(t => t.status !== 'done');

            return (
              <motion.div
                key={day}
                whileHover={{ backgroundColor: '#f8fafc' }}
                onClick={() => openDay(day)}
                className={`
                  min-h-[80px] p-2 cursor-pointer relative flex flex-col transition-colors
                  ${isTod    ? 'bg-indigo-50/60' : ''}
                  ${isPast && !isTod ? 'bg-gray-50/50' : ''}
                `}
              >
                {/* Day number */}
                <div className={`
                  w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 self-end
                  ${isTod
                    ? 'bg-indigo-600 text-white'
                    : isPast ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
                  }
                `}>
                  {day}
                </div>

                {/* Task chips */}
                <div className="flex-1 space-y-0.5 overflow-hidden">
                  {dayTasks.slice(0, 3).map(t => (
                    <div
                      key={t.id}
                      className={`
                        text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md truncate font-medium
                        ${PRIORITY_BADGE_CLASSES[t.priority]}
                      `}
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] text-gray-400 px-1 font-medium">
                      +{dayTasks.length - 3} más
                    </div>
                  )}
                </div>

                {/* Overdue dot */}
                {hasOverdue && dayTasks.length > 0 && (
                  <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-red-400" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="card px-5 py-3 flex flex-wrap items-center gap-4 flex-shrink-0">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad:</span>
        {(['low', 'medium', 'high', 'critical'] as const).map(p => (
          <div key={p} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${PRIORITY_DOT_CLASSES[p]}`} />
            <span className="text-xs text-gray-600">{PRIORITY_LABELS[p]}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <span className="text-xs text-gray-400">Vencida</span>
        </div>
      </div>

      {/* Day tasks modal */}
      <AnimatePresence>
        {showModal && selectedDate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto
                         bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-5 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CalIcon size={16} className="opacity-80" />
                      <h2 className="text-lg font-bold capitalize">
                        {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                      </h2>
                    </div>
                    <p className="text-indigo-200 text-sm">
                      {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'tarea' : 'tareas'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal content */}
              <div className="p-5 max-h-[60vh] overflow-y-auto">
                {selectedDayTasks.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <CalIcon size={22} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium text-sm">Sin tareas este día</p>
                    <p className="text-gray-400 text-xs mt-1">Usa el botón "Nueva tarea" para crear una</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedDayTasks.map((task, i) => (
                      <motion.button
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
                        onClick={() => { onTaskClick(task); setShowModal(false); }}
                        className="w-full text-left p-4 rounded-xl bg-gray-50 hover:bg-gray-100
                                   transition-colors border border-gray-100 hover:border-gray-200 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
                            )}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE_CLASSES[task.priority]}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT_CLASSES[task.priority]}`} />
                                {PRIORITY_LABELS[task.priority]}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_CLASSES[task.status]}`} />
                                {STATUS_LABELS[task.status]}
                              </span>
                            </div>
                          </div>
                          <ChevronRightIcon size={16} className="text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0 mt-1" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 px-5 py-3 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary text-sm py-2"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

