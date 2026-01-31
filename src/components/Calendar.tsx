import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Task } from '../types';
import { PRIORITY_COLORS } from '../types';

interface CalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function Calendar({ tasks, onTaskClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getTasksForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateString;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowDayModal(true);
  };

  const closeDayModal = () => {
    setShowDayModal(false);
    setSelectedDate(null);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="w-full h-full mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-6 overflow-y-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-left">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 sm:px-4 py-2 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors active:scale-95"
            >
              Hoy
            </button>
            <button
              onClick={previousMonth}
              className="p-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors active:scale-95"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={20} className="sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors active:scale-95"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={20} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3 md:p-4">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs sm:text-sm font-semibold text-gray-700 py-1 sm:py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            );
            const dayTasks = getTasksForDate(date);
            const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.01 }}
                onClick={() => handleDayClick(date)}
                className={`
                  aspect-square border rounded-lg p-1 sm:p-2 relative overflow-hidden cursor-pointer
                  ${isToday(day) ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'}
                  ${isPast && !isToday(day) ? 'bg-gray-50' : ''}
                  ${dayTasks.length > 0 ? 'hover:shadow-md' : 'hover:bg-gray-50'}
                  transition-all duration-200 active:scale-95
                `}
              >
                <div className="text-xs sm:text-sm font-medium text-gray-900 mb-0.5 sm:mb-1">
                  {day}
                </div>

                {/* Tasks for this day */}
                {dayTasks.length > 0 && (
                  <div className="space-y-0.5 sm:space-y-1 overflow-hidden pointer-events-none">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className={`
                          w-full text-left text-[9px] sm:text-xs px-0.5 sm:px-1 py-0.5 rounded truncate
                          border-l-2 ${PRIORITY_COLORS[task.priority]}
                          bg-gray-50
                        `}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[8px] sm:text-xs text-gray-500 px-0.5 sm:px-1">
                        +{dayTasks.length - 2}
                      </div>
                    )}
                  </div>
                )}

                {/* Task count indicator */}
                {dayTasks.length > 0 && (
                  <div className="absolute top-1 right-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                      {dayTasks.length}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Leyenda de Prioridades</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-l-blue-500 bg-gray-50"></div>
            <span className="text-sm text-gray-600">Baja</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-l-yellow-500 bg-gray-50"></div>
            <span className="text-sm text-gray-600">Media</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-l-orange-500 bg-gray-50"></div>
            <span className="text-sm text-gray-600">Alta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-l-red-500 bg-gray-50"></div>
            <span className="text-sm text-gray-600">Crítica</span>
          </div>
        </div>
      </div>

      {/* Day Tasks Modal */}
      <AnimatePresence>
        {showDayModal && selectedDate && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDayModal}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              {/* Modal */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold mb-1">
                        {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                      </h2>
                      <p className="text-sm sm:text-base text-blue-100">
                        {getTasksForDate(selectedDate).length} {getTasksForDate(selectedDate).length === 1 ? 'tarea' : 'tareas'}
                      </p>
                    </div>
                    <button
                      onClick={closeDayModal}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors active:scale-95"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {getTasksForDate(selectedDate).length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-2">
                        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg font-medium">No hay tareas para este día</p>
                      <p className="text-gray-400 text-sm mt-1">Haz clic en "Add Task" para crear una nueva tarea</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getTasksForDate(selectedDate).map((task) => (
                        <motion.button
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => {
                            onTaskClick(task);
                            closeDayModal();
                          }}
                          className={`
                            w-full text-left p-4 rounded-lg border-l-4 
                            ${PRIORITY_COLORS[task.priority]}
                            bg-gray-50 hover:bg-gray-100 
                            transition-all duration-200 
                            hover:shadow-md active:scale-[0.98]
                          `}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1 truncate">
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`
                                  text-xs font-medium px-2 py-1 rounded-full
                                  ${task.priority === 'low' ? 'bg-blue-100 text-blue-700' :
                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                    'bg-red-100 text-red-700'}
                                `}>
                                  {task.priority === 'low' ? 'Baja' :
                                   task.priority === 'medium' ? 'Media' :
                                   task.priority === 'high' ? 'Alta' : 'Crítica'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {task.status === 'todo' ? 'Por hacer' :
                                   task.status === 'in-progress' ? 'En progreso' : 'Completada'}
                                </span>
                              </div>
                            </div>
                            <div className="text-gray-400 hover:text-gray-600 transition-colors">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
